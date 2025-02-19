import { User } from '@/models/user-model'
import { FastifyRequest, FastifyReply } from 'fastify'
import { hash, compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'
import config from '../../config'
import { prisma } from '@/plugins/prisma.plugins'
import { daysInWeek } from 'date-fns/constants'
import { findOrCreatePeriod } from '@/services/period.services'
import { daysToWeeks, format, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const getHealth = async (req: FastifyRequest, res: FastifyReply) => {
    const transactionsQuery = await prisma.transactions.findMany({
        where: { isDelete: false },
        select: {
            billed: true,
            value: true,
            type: true
        }
    })

    const totalBalance = transactionsQuery.reduce((sum, t) => {
        if (t.billed) {
            return sum + t.value
        }
        return sum - t.value
    }, 0)

    const periodNow = await findOrCreatePeriod({ periodAt: new Date() })
    const transactionsQueryInPeriodNow = await prisma.transactions.findMany({
        where: { periodId: periodNow.id },
        select: { billed: true, value: true, type: true }
    })
    const initialBalanceInPeriod = transactionsQueryInPeriodNow
        .filter(t => t.type === 'INPUT' && !t.billed)  // Compras a prazo
        .reduce((sum, { value }) => sum + value, 0)

    // Calcular o saldo final (contas a pagar no final do período)
    const endBalanceInPeriod = transactionsQueryInPeriodNow
        .filter(t => t.type === 'INPUT' && !t.billed)  // Compras a prazo
        .reduce((sum, { value }) => sum + value, 0)

    // Cálculo das compras a prazo (INPUTs com 'billed' como true)
    const totalPurchases = transactionsQueryInPeriodNow.reduce((sum, { value, billed, type }) => {
        if (type === 'INPUT' && billed) {
            return sum + value
        }
        return sum
    }, 0)

    const periodDays = (periodNow.endTime.getTime() - periodNow.startTime.getTime()) / (1000 * 3600 * 24)  // Dias do período
    const pmp = ((initialBalanceInPeriod + endBalanceInPeriod) / 2) * periodDays / totalPurchases



    // Calcular o saldo inicial de contas a receber (vendas a prazo no início do período)
    const initialReceivablesBalance = transactionsQueryInPeriodNow
        .filter(t => t.type === 'OUTPUT' && !t.billed)  // Vendas a prazo não pagas
        .reduce((sum, { value }) => sum + value, 0)

    // Calcular o saldo final de contas a receber (vendas a prazo no final do período)
    const finalReceivablesBalance = transactionsQueryInPeriodNow
        .filter(t => t.type === 'OUTPUT' && !t.billed)  // Vendas a prazo não pagas
        .reduce((sum, { value }) => sum + value, 0)

    // Cálculo das vendas a prazo (OUTPUTs com 'billed' como true)
    const totalSalesOnCredit = transactionsQueryInPeriodNow.reduce((sum, { value, billed, type }) => {
        if (type === 'OUTPUT' && billed) {
            return sum + value
        }
        return sum
    }, 0)

    // Cálculo do PMR
    const pmr = ((initialReceivablesBalance + finalReceivablesBalance) / 2) * periodDays / totalSalesOnCredit

    const accountPayable = transactionsQuery
        .filter(({ type, billed }) => type === 'OUTPUT' && !billed)
        .reduce((sum, { value }) => sum + value, 0)


    const transactionOnPeriodsQuery = await prisma.period.findMany({ include: { transactions: { select: { billed: true, value: true, type: true } } } })
    const transactionsOnPeriods = transactionOnPeriodsQuery
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

    return res.send({ totalBalance, pmp, pmr, accountPayable, transactionsOnPeriods })
}


export { getHealth }