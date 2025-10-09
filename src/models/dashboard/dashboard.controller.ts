import { FastifyRequest, FastifyReply } from 'fastify'
import { db } from '@/plugins/prisma.plugins'
import { findOrCreatePeriod } from '@/services/period.services'
import { finances } from '@/services/finance.transactions'
import { financesBank } from '@/services/finance.banks'
import dashboard from './dashboard.routes'

const getHealth = async (req: FastifyRequest, res: FastifyReply) => {

    const transactionsQuery = await db.transactions.findMany({
        where: {
            isDelete: false,
            OR: [{
                order: { OR: [{ status: { flag: { notIn: ["BUDGET"] } } }] }
            }, {
                order: null
            }]
        },
        include: { installments: true }
    })

    // buscar periods com installments (com transaction, para facilitar)
    const transactionOnPeriodsQuery = await db.period.findMany({
        include: { installments: { include: { transaction: true } } },
        orderBy: { name: "asc" }
    })

    // opcional: buscar bancos para runway (assumindo que Bank tem campo 'balance')
    const banksQuery = await db.bank.findMany({
        include: { transactions: true }
    })

    const { total, pmr, pmp, transactionsOnPeriods, notBilled, ...rest } = await finances(transactionsQuery, transactionOnPeriodsQuery, { banks: banksQuery, horizonMonths: 6, currentCashOverride: 100 })

    return res.send({
        totalBalance: total.balance,
        pmp,
        pmr,
        accountPayable: total.out,
        transactionsOnPeriods,
        total,
        notBilled,
        dashboard: { total, pmr, pmp, transactionsOnPeriods, notBilled, ...rest }
    })
}

const getBanks = async (req: FastifyRequest, res: FastifyReply) => {
    const banksQuery = await db.bank.findMany({ include: { transactions: { include: { installments: true } } } })
    const banks = financesBank(banksQuery).map((b, index) => ({ ...b, isDefault: index === 0 }))

    return res.send({ banks: banks })
}


export { getHealth, getBanks }