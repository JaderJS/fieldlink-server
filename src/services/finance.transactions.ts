import transactions from "@/model/transaction/transactions.routes"
import { Period, Prisma, Transactions } from "@prisma/client"
import { differenceInDays, format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"


type CalcFinances = {
    pmp: number
    pmr: number
    transactionsOnPeriods: { month: string, in: number, out: number, acc: number }[]
    inPeriod: {
        transactions: Partial<Transactions>[]
    },
    periods: {
        id: number,
        name: string,
        startDate: Date,
        endDate: Date,
        in: number,
        out: number,
        transactions: Transactions[]
    }[],
    notBilled: {
        out: number
        in: number
    },
    total: {
        in: number
        out: number
        balance: number
        transactions: Partial<Transactions>[]
        outSuppliers: number
    }
}

export const finances = (transactions: Transactions[], periods: db.PeriodGetPayload<{ include: { transactions: true } }>[]): CalcFinances => {

    const transactionsOnPeriods = periods
        .map(({ name, transactions: t }) => ({
            month: format(parse(name, 'MM/yyyy', new Date()), "MMM yyyy", { locale: ptBR }),
            in: t.filter(({ type, billed }) => type === "INPUT" && billed).reduce((sum, { value }) => sum + value, 0),
            out: t.filter(({ type, billed }) => type === "OUTPUT" && billed).reduce((sum, { value }) => sum + value, 0),
        }))
        .filter((item) => item.in !== 0 || item.out !== 0)
        .reduce<{ month: string, in: number, out: number, acc: number }[]>((acc, item, index) => {
            const accumulated = index === 0 ? (item.in - item.out) : (acc[index - 1].acc + item.in - item.out);
            return [...acc, { ...item, acc: accumulated }]
        }, [])



    return {
        pmp: pmpFn(transactions),
        pmr: pmrFn(transactions),
        transactionsOnPeriods,
        inPeriod: {
            transactions: transactions,
        },
        periods: [],
        notBilled: {
            out: totalOutNotBilledFn(transactions),
            in: totalInNotBilledFn(transactions)
        },
        total: {
            in: totalInFn(transactions),
            out: totalOutFn(transactions),
            balance: totalBalanceFn(transactions),
            outSuppliers: totalOutSuppliers(transactions),
            transactions: transactions,
        }
    }
}

/**
 * @description Calcula o total faturado de saída das transações
 * @returns number
 */
const totalOutFn = (transactions: Transactions[]) => {
    return transactions
        .filter(({ type, billed }) => type === "OUTPUT" && billed)
        .reduce((sum, { value }) => sum + value, 0);
}

/**
 * @description Calcula o total faturado da entrada das transações
 * @returns number
 */
const totalInFn = (transactions: Transactions[]) => {
    return transactions
        .filter(({ type, billed }) => type === "INPUT" && billed)
        .reduce((sum, { value }) => sum + value, 0);
}

/**
 * @description Calcula o total previsto e faturado de saída dos fornecedores
 * @returns number
 */
const totalOutSuppliers = (transactions: Transactions[]) => {
    return transactions
        .filter(({ type, cartId, billed }) => type === "OUTPUT" && billed && !!cartId)
        .reduce((sum, { value }) => sum + value, 0)
}

/**
 * @description Calcula o total previsto de saída
 * @returns number
 */
const totalOutNotBilledFn = (transactions: Transactions[]) => {
    return transactions
        .filter(({ type, cartId, billed }) => type === "OUTPUT" && !billed)
        .reduce((sum, { value }) => sum + value, 0)
}

/**
 * @description Calcula o total previsto de entrada
 * @returns number
 */
const totalInNotBilledFn = (transactions: Transactions[]) => {
    return transactions
        .filter(({ type, cartId, billed }) => type === "INPUT" && !billed)
        .reduce((sum, { value }) => sum + value, 0)
}

const pmpFn = (transactions: Transactions[]) => {
    const payments = transactions.filter(({ type }) => type === 'OUTPUT')

    if (payments.length === 0) return 0

    const totalDays = payments.reduce((sum, { fromAt }) => {
        return sum + differenceInDays(new Date(), fromAt)
    }, 0)

    return totalDays / payments.length
}

const pmrFn = (transactions: Transactions[]) => {
    const receivables = transactions.filter(({ type }) => type === 'INPUT')

    if (receivables.length === 0) return 0

    const totalDays = receivables.reduce((sum, { fromAt }) => {
        return sum + differenceInDays(new Date(), fromAt)
    }, 0)

    return totalDays / receivables.length
}

const totalBalanceFn = (transactions: Transactions[]) => {
    return transactions.reduce((sum, { value, billed }) => !!billed ? (sum + value) : (sum - value), 0)
}
