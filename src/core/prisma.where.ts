import { z } from "zod";
import { Prisma } from "@/../prisma/generated/client"

/* ---------------- utilitários de tipo ---------------- */

type NonOpt<T> = T extends undefined | null ? Exclude<T, undefined | null> : T;

type FilterFn<W, V> = (params: { filter: V; keyPath: string[] }) => Partial<W>;

type GroupDef<T, W> = {
  op?: "AND" | "OR";
  fields: FiltersMapFromShape<T, W>;
};

/**
 * Gera o mapa de filtros a partir da shape inferida (tipo TS) do schema.
 * - se a propriedade for objeto -> aceita GroupDef ou map aninhado
 * - se for array -> se item for objeto aceita map aninhado, senão aceita FilterFn para o item
 * - se for primitivo -> FilterFn para o tipo primitivo
 */
type FiltersMapFromShape<T, W> = {
  [K in keyof T]?: NonOpt<T[K]> extends Array<infer Item>
  ? Item extends object
  ? GroupDef<Item, W> | FiltersMapFromShape<Item, W>
  : FilterFn<W, Item>
  : NonOpt<T[K]> extends object
  ? GroupDef<NonOpt<T[K]>, W> | FiltersMapFromShape<NonOpt<T[K]>, W>
  : FilterFn<W, NonOpt<T[K]>>;
};

/* ---------------- makeFilters helper ---------------- */

/**
 * makeFilters(schema)<W>()(map)
 * - evita anotações manuais do map: o TS infere a shape a partir do schema
 */
export function makeFilters<S extends z.ZodTypeAny>(schema: S) {
  type Shape = z.infer<S>;
  return function <W>() {
    return function <F extends FiltersMapFromShape<Shape, W>>(f: F): F {
      return f;
    };
  };
}

/* ---------------- whereConstructor ---------------- */

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

const shouldSkip = (v: unknown) =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "");

/**
 * whereConstructor recebe:
 * - schema (zod) - usado p/ coerce/validar o query
 * - filters (map tipado a partir do schema)
 * - query bruto (req.params / req.query)
 *
 * Retorna W | undefined. Você pode fazer `as Prisma.StationWhereInput` no call site se precisar.
 */
export function whereConstructor<S extends z.ZodTypeAny, W>(params: {
  schema: S;
  filters: FiltersMapFromShape<z.infer<S>, W>;
  query?: unknown;
}): W | undefined {
  const { schema, filters, query } = params;
  if (!query) return undefined;

  const parsed = schema.safeParse(query);
  if (!parsed.success) return undefined; // ou lance o erro se preferir

  const data = parsed.data as unknown as Record<string, unknown>;

  const build = (
    obj: Record<string, unknown>,
    map: FiltersMapFromShape<any, W>,
    path: string[] = []
  ): Partial<W>[] => {
    const acc: Partial<W>[] = [];

    for (const [key, rawValue] of Object.entries(obj)) {
      if (shouldSkip(rawValue)) continue;

      const entry = (map as any)?.[key];
      if (!entry) continue;

      // GroupDef (op + fields)
      if (typeof entry === "object" && "fields" in entry) {
        const group = entry as GroupDef<any, W>;
        if (isPlainObject(rawValue)) {
          const inner = build(rawValue as Record<string, unknown>, group.fields, [...path, key]);
          if (inner.length === 0) continue;
          if (inner.length === 1) {
            // se só um fragmento interno, não embrulha em op desnecessariamente
            acc.push(inner[0]);
          } else {
            acc.push(({ [group.op ?? "AND"]: inner } as unknown) as Partial<W>);
          }
        }
        continue;
      }

      // Leaf function
      if (typeof entry === "function") {
        const fn = entry as FilterFn<W, unknown>;
        acc.push(fn({ filter: rawValue, keyPath: [...path, key] }));
        continue;
      }

      // Nested map (objeto aninhado)
      if (isPlainObject(rawValue) && typeof entry === "object") {
        const inner = build(rawValue as Record<string, unknown>, entry as any, [...path, key]);
        acc.push(...inner);
        continue;
      }

      // array handling: se rawValue é array e entry é um map (provavelmente array de objetos)
      if (Array.isArray(rawValue) && typeof entry === "object") {
        for (const item of rawValue) {
          if (isPlainObject(item)) {
            const inner = build(item as Record<string, unknown>, entry as any, [...path, key]);
            acc.push(...inner);
          }
        }
        continue;
      }
    }

    return acc;
  };

  const fragments = build(data, filters);

  if (fragments.length === 0) return undefined;
  if (fragments.length === 1) return fragments[0] as W;
  // combinação global em AND (padrão)
  return ({ AND: fragments } as unknown) as W;
}
// type IAvailableFiltersInput = {
//     filter: unknown,
// }

// type IAvailableFiltersOutput<T> = {
//     where: T
// }

// type IAvailableFilters<T> = {
//     [key: string]: (params: IAvailableFiltersInput) => IAvailableFiltersOutput<T>
// }
// type IApplyFiltersInput<T> = {
//     filters: IAvailableFilters<T>
//     query: { [key: string]: unknown }
// }
// /**
//  *
//  * @param params IApplyFiltersInput
//  * @returns Returns the where of the prism and the filters applied to return to the frontend
//  */
// export const whereConstructor = <T>({ filters, query }: IApplyFiltersInput<T>): T | undefined => {
//     const whereBuilder: T = {} as T

//     if (Object.entries(query).length === 0) {
//         return undefined
//     }

//     const whereConditions: object[] = []

//     for (const [key, value] of Object.entries(query)) {
//         if (filters[key] && value) {
//             const { where } = filters[key]({
//                 filter: value,
//             })
//             Object.assign(whereBuilder as object, where as object)
//         }
//     }

//     if (whereConditions.length > 0) {
//         Object.assign(whereBuilder as object, { AND: whereConditions })
//     }

//     return whereBuilder

// }