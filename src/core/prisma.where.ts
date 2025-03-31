type IAvailableFiltersInput = {
    filter: unknown,
}

type IAvailableFiltersOutput<T> = {
    where: T
}

type IAvailableFilters<T> = {
    [key: string]: (params: IAvailableFiltersInput) => IAvailableFiltersOutput<T>
}
type IApplyFiltersInput<T> = {
    filters: IAvailableFilters<T>
    query: { [key: string]: unknown }
}
/**
 *
 * @param params IApplyFiltersInput
 * @returns Returns the where of the prism and the filters applied to return to the frontend
 */
export const whereConstructor = <T>({ filters, query }: IApplyFiltersInput<T>,): T | undefined => {
    const whereBuilder: T = {} as T

    if (Object.entries(query).length === 0) {
        return undefined
    }

    const whereConditions: object[] = []

    for (const [key, value] of Object.entries(query)) {
        if (filters[key] && value) {
            const { where } = filters[key]({
                filter: value,
            })
            Object.assign(whereBuilder as object, where as object)
        }
    }

    if (whereConditions.length > 0) {
        Object.assign(whereBuilder as object, { AND: whereConditions })
    }

    return whereBuilder

}