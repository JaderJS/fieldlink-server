import { differenceInDays, format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Prisma, Installment } from "@/../prisma/generated/client"


/**
 * Converte centavos -> reais (number com 2 casas)
 */
const centsToReais = (cents: number) => Number((cents / 100).toFixed(2));

/* ---------- Tipagens usando Prisma (ajuste se necessário) ---------- */
export type TxWithInstallments = Prisma.TransactionsGetPayload<{
    include: { installments: true };
}>;

export type PeriodWithInstallments = Prisma.PeriodGetPayload<{
    include: { installments: { include: { transaction?: true } } };
}>;

/* ---------- Resultado principal (todos os valores monetários em REAIS) ---------- */
export type CalcFinancesReais = {
    pmp: number;
    pmr: number;
    transactionsOnPeriods: { month: string; in: number; out: number; acc: number }[];
    inPeriod: { installments: any[] }; // installments com value em reais
    periods: {
        id: number;
        name: string;
        startDate?: Date | null;
        endDate?: Date | null;
        in: number;
        out: number;
        installments: any[]; // parcelas com value em reais
    }[];
    notBilled: { out: number; in: number };
    total: {
        in: number;
        out: number;
        balance: number;
        installments: any[]; // parcelas com value em reais
        outSuppliers: number;
    };
    aging: {
        receivables: Record<string, number>;
        payables: Record<string, number>;
    };
    projectedCashflow?: { month: string; projectedNet: number; inflow: number; outflow: number }[];
    runwayMonths?: number | null;
};

/**
 * finances: recebe transactions (com installments) e periods (com installments) e retorna tudo EM REAIS.
 */
export const finances = async (
    transactions: TxWithInstallments[],
    periods: PeriodWithInstallments[],
    opts?: {
        now?: Date;
        horizonMonths?: number;
        banks?: { id: number; name?: string; balance?: number }[]; // balance em centavos se existir
        currentCashOverride?: number; // em centavos (opcional)
    }
): Promise<CalcFinancesReais> => {
    const now = opts?.now ?? new Date();
    const horizon = opts?.horizonMonths ?? 6;

    // flatten installments vindo de transactions
    const installmentsFromTransactions: Installment[] = transactions.flatMap((t) =>
        (t.installments ?? []).map((i) => ({ ...i, transactionId: i.transactionId }))
    );

    const installmentsFromPeriods: Installment[] = periods.flatMap((p) =>
        (p.installments ?? []).map((i) => ({ ...i, transactionId: i.transactionId }))
    );

    const allInstallments = installmentsFromTransactions.length > 0 ? installmentsFromTransactions : installmentsFromPeriods;

    // map tx by id para obter tipo/cartId
    const txById = new Map<number, TxWithInstallments>();
    transactions.forEach((t) => txById.set(t.id, t));
    const getTx = (inst: Installment) => txById.get(inst.transactionId as number) as TxWithInstallments | undefined;

    /* ---------- cálculos em CENTAVOS (inteiros) ---------- */
    const sumInstallments = (arr: Installment[], predicate: (i: Installment) => boolean) =>
        arr.filter(Boolean).filter((i) => predicate(i)).reduce((s, i) => s + (i.value ?? 0), 0);

    const totalInCents = sumInstallments(allInstallments, (i) => getTx(i)?.type === "INPUT" && i.billed);
    const totalOutCents = sumInstallments(allInstallments, (i) => getTx(i)?.type === "OUTPUT" && i.billed);

    const totalOutSuppliersCents = sumInstallments(allInstallments, (i) => {
        const t = getTx(i);
        return !!t && t.type === "OUTPUT" && i.billed && !!t.cartId;
    });

    const notBilledOutCents = sumInstallments(allInstallments, (i) => getTx(i)?.type === "OUTPUT" && !i.billed);
    const notBilledInCents = sumInstallments(allInstallments, (i) => getTx(i)?.type === "INPUT" && !i.billed);

    const balanceCents = allInstallments.reduce((sum, i) => {
        const t = getTx(i);
        if (!t) return sum;
        if (i.billed) return sum + (t.type === "INPUT" ? i.value : -i.value);
        // lógica antiga: não-faturado subtrai
        return sum - (t.type === "INPUT" ? i.value : -i.value);
    }, 0);

    const transactionsOnPeriodsCents = periods
        .map((p) => {
            const month = format(parse(p.name, "MM/yyyy", new Date()), "MMM yyyy", { locale: ptBR });
            const inAmount = (p.installments ?? []).filter((i) => (getTx(i)?.type === "INPUT") && i.billed).reduce((s, i) => s + i.value, 0);
            const outAmount = (p.installments ?? []).filter((i) => (getTx(i)?.type === "OUTPUT") && i.billed).reduce((s, i) => s + i.value, 0);
            return { month, in: inAmount, out: outAmount };
        })
        .filter((it) => it.in !== 0 || it.out !== 0)
        .reduce<{ month: string; in: number; out: number; acc: number }[]>((acc, item, idx) => {
            const accPrev = idx === 0 ? 0 : acc[idx - 1].acc;
            const accumulated = accPrev + item.in - item.out;
            return [...acc, { ...item, acc: accumulated }];
        }, []);

    const pmpCents = calcAvgPaymentDelayCents(allInstallments.filter((i) => getTx(i)?.type === "OUTPUT"), now);
    const pmrCents = calcAvgPaymentDelayCents(allInstallments.filter((i) => getTx(i)?.type === "INPUT"), now);

    const agingReceivablesCents = agingBucketsCents(allInstallments.filter((i) => getTx(i)?.type === "INPUT"), now);
    const agingPayablesCents = agingBucketsCents(allInstallments.filter((i) => getTx(i)?.type === "OUTPUT"), now);

    const projectedCashflowCents = projectCashflowCents(allInstallments, now, horizon, getTx);

    // runway: resolve currentCash em centavos
    const sumBankBalances = (opts?.banks && opts.banks.length > 0)
        ? opts.banks.reduce((s, b) => s + (typeof (b as any).balance === "number" ? (b as any).balance : 0), 0)
        : null;

    const paidBalanceFallback = computePaidBalanceCents(allInstallments, getTx);

    const currentCashCents =
        typeof opts?.currentCashOverride === "number"
            ? opts.currentCashOverride
            : (sumBankBalances && sumBankBalances > 0)
                ? sumBankBalances
                : paidBalanceFallback;

    const avgMonthlyNetCents = averageNetLastMonthsCents(transactionsOnPeriodsCents, 3);
    const runwayMonths = currentCashCents == null || avgMonthlyNetCents <= 0 ? null : Math.floor(currentCashCents / avgMonthlyNetCents);

    /* ---------- converter TUDO para REAIS (apenas na saída) ---------- */

    // helper que converte um installment (mantém campos temporais, converte valores)
    const convertInstallment = (i: Installment) => {
        return {
            ...i,
            value: centsToReais(i.value ?? 0),
            installmentsTotal: i.installmentsTotal != null ? centsToReais(i.installmentsTotal) : undefined,
        };
    };

    const allInstallmentsReais = allInstallments.map(convertInstallment);

    const transactionsOnPeriodsReais = transactionsOnPeriodsCents.map((t) => ({
        month: t.month,
        in: centsToReais(t.in),
        out: centsToReais(t.out),
        acc: centsToReais(t.acc),
    }));

    const periodsOut = periods.map((p) => {
        const inAmount = (p.installments ?? []).filter((i) => (getTx(i)?.type === "INPUT") && i.billed).reduce((s, i) => s + i.value, 0);
        const outAmount = (p.installments ?? []).filter((i) => (getTx(i)?.type === "OUTPUT") && i.billed).reduce((s, i) => s + i.value, 0);
        return {
            id: p.id,
            name: p.name,
            startDate: (p as any).startDate ?? null,
            endDate: (p as any).endDate ?? null,
            in: centsToReais(inAmount),
            out: centsToReais(outAmount),
            installments: (p.installments ?? []).map(convertInstallment),
        };
    });

    const projectedCashflowReais = projectedCashflowCents.map((m) => ({
        month: m.month,
        inflow: centsToReais(m.inflow),
        outflow: centsToReais(m.outflow),
        projectedNet: centsToReais(m.projectedNet),
    }));

    const agingReceivablesReais = Object.fromEntries(Object.entries(agingReceivablesCents).map(([k, v]) => [k, centsToReais(v)]));
    const agingPayablesReais = Object.fromEntries(Object.entries(agingPayablesCents).map(([k, v]) => [k, centsToReais(v)]));

    return {
        pmp: pmpCents, // já era média de dias, permanece
        pmr: pmrCents,
        transactionsOnPeriods: transactionsOnPeriodsReais,
        inPeriod: { installments: allInstallmentsReais },
        periods: periodsOut,
        notBilled: { out: centsToReais(notBilledOutCents), in: centsToReais(notBilledInCents) },
        total: {
            in: centsToReais(totalInCents),
            out: centsToReais(totalOutCents),
            balance: centsToReais(balanceCents),
            outSuppliers: centsToReais(totalOutSuppliersCents),
            installments: allInstallmentsReais,
        },
        aging: { receivables: agingReceivablesReais, payables: agingPayablesReais },
        projectedCashflow: projectedCashflowReais,
        runwayMonths,
    };
};

/* ---------- helpers em CENTAVOS ---------- */

function calcAvgPaymentDelayCents(installments: Installment[], now: Date) {
    const considered = installments.filter((i) => i.dueAt);
    if (considered.length === 0) return 0;

    const paid = considered.filter((i) => i.paidAt);
    if (paid.length > 0) {
        const totalDays = paid.reduce((sum, i) => sum + differenceInDays(i.paidAt as Date, i.dueAt), 0);
        return Math.round(totalDays / paid.length);
    }

    const totalDays = considered.reduce((sum, i) => sum + differenceInDays(now, i.dueAt), 0);
    return Math.round(totalDays / considered.length);
}

function agingBucketsCents(installments: Installment[], now: Date) {
    const buckets: Record<string, number> = { not_due: 0, "0-30": 0, "31-60": 0, "61-90": 0, "90+": 0 };
    for (const i of installments) {
        if (i.billed) continue;
        const daysPastDue = Math.max(0, differenceInDays(now, i.dueAt));
        if (differenceInDays(i.dueAt, now) > 0) {
            buckets.not_due += i.value ?? 0;
        } else if (daysPastDue <= 30) {
            buckets["0-30"] += i.value ?? 0;
        } else if (daysPastDue <= 60) {
            buckets["31-60"] += i.value ?? 0;
        } else if (daysPastDue <= 90) {
            buckets["61-90"] += i.value ?? 0;
        } else {
            buckets["90+"] += i.value ?? 0;
        }
    }
    return buckets;
}

function projectCashflowCents(
    installments: Installment[],
    now: Date,
    horizonMonths: number,
    getTx: (i: Installment) => TxWithInstallments | undefined
) {
    const months: { key: string; date: Date; inflow: number; outflow: number }[] = [];
    for (let m = 0; m < horizonMonths; m++) {
        const d = new Date(now.getFullYear(), now.getMonth() + m, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        months.push({ key, date: d, inflow: 0, outflow: 0 });
    }

    for (const inst of installments) {
        if (inst.status !== "PENDING" && inst.status !== "PARTIAL") continue;
        const due = new Date(inst.dueAt);
        const key = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}`;
        const idx = months.findIndex((m) => m.key === key);
        if (idx === -1) continue;
        const t = getTx(inst);
        if (t?.type === "INPUT") months[idx].inflow += inst.value ?? 0;
        if (t?.type === "OUTPUT") months[idx].outflow += inst.value ?? 0;
    }

    return months.map((m) => ({
        month: format(m.date, "MMM yyyy", { locale: ptBR }),
        projectedNet: m.inflow - m.outflow,
        inflow: m.inflow,
        outflow: m.outflow,
    }));
}

function averageNetLastMonthsCents(transactionsOnPeriods: { month: string; in: number; out: number }[], lastN = 3) {
    if (!transactionsOnPeriods || transactionsOnPeriods.length === 0) return 0;
    const tail = transactionsOnPeriods.slice(-lastN);
    const nets = tail.map((t) => t.in - t.out);
    const avg = nets.reduce((s, x) => s + x, 0) / (nets.length || 1);
    return avg;
}

function computePaidBalanceCents(installments: Installment[], getTx: (i: Installment) => TxWithInstallments | undefined) {
    let balance = 0;
    for (const i of installments) {
        if (!i.paidAt) continue;
        const t = getTx(i);
        if (!t) continue;
        if (t.type === "INPUT") balance += i.value ?? 0;
        if (t.type === "OUTPUT") balance -= i.value ?? 0;
    }
    return balance;
}
