import { User } from '@/models/user-model'
import { FastifyRequest, FastifyReply } from 'fastify'
import { hash, compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'
import config from '../../../config'
import { db } from '@/plugins/prisma.plugins'
import { daysInWeek } from 'date-fns/constants'
import { findOrCreatePeriod } from '@/services/period.services'
import { daysToWeeks, format, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { finances } from '@/services/finance.transactions'
import { financesBank } from '@/services/finance.banks'

const getHealth = async (req: FastifyRequest, res: FastifyReply) => {
    const transactionsQuery = await db.transactions.findMany({
        where: { isDelete: false },
    })

    const periodNow = await findOrCreatePeriod({ periodAt: new Date() })

    const transactionsQueryInPeriodNow = await db.transactions.findMany({
        where: { periodId: periodNow.id },
        select: { billed: true, value: true, type: true }
    })

    const transactionOnPeriodsQuery = await db.period.findMany({ include: { transactions: {} } })

    const { total, pmr, pmp, transactionsOnPeriods, notBilled } = finances(transactionsQuery, transactionOnPeriodsQuery)

    return res.send({ totalBalance: total.balance, pmp, pmr, accountPayable: total.out, transactionsOnPeriods, total, notBilled })
}

const getBanks = async (req: FastifyRequest, res: FastifyReply) => {
    const banksQuery = await db.bank.findMany({ include: { transactions: true } })
    const banks = financesBank(banksQuery).map((b, index) => ({ ...b, isDefault: index === 0 }))

    return res.send({ banks: banks })
}


export { getHealth, getBanks }