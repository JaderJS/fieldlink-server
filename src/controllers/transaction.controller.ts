import { prisma } from '@/plugins/prisma.plugins'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const getTransactions = async (req: FastifyRequest, reply: FastifyReply) => {
    const transactions = await prisma.transactions.findMany({
        where: { isDelete: false },
        include: {
            createdBy: { omit: { password: true, isEnable: true, role: true } },
            updatedBy: { omit: { password: true, isEnable: true, role: true } },
            bank: {},
            company: {},
            period: {},
            cart: { include: { supplier: {} } },
            order: { include: { client: {} } },
            service: { include: { client: {} } }
        },
        orderBy: [{ period: { startTime: 'desc' } }, { fromAt: 'desc' }]
    })

    const process = transactions.map(({ value, ...transaction }) => ({
        ...transaction,
        value: transaction.type === 'OUTPUT' ? value * -1 : value
    }))

    return reply.send({ transactions: process })
}

const getTransaction = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)
    const transaction = await prisma.transactions.findUnique({
        where: { id },
        include: {
            createdBy: { omit: { password: true, isEnable: true, role: true } },
            updatedBy: { omit: { password: true, isEnable: true, role: true } },
            bank: {},
            company: {},
            period: {},
            cart: {},
            service: {}
        },
    })

    return reply.send({ transaction })
}

const createOneTransaction = async (req: FastifyRequest, res: FastifyReply) => {

    const { id, title, type, periodId, value, content, ...transaction } = z
        .object({
            id: z.number().default(0),
            title: z.string().min(3),
            type: z.enum(['INPUT', 'OUTPUT']),
            description: z.string().optional(),
            hasNfe: z.boolean().default(false),
            value: z.coerce.number(),
            content: z.string(),
            billed: z.boolean().default(false),
            fileUrl: z.string().optional(),
            periodId: z.coerce.number(),
            fromAt: z.coerce.date(),
            bankId: z.number(),
            companyId: z.number(),
            serviceId: z.number().default(0)
        })
        .parse(req.body)

    const bank = await prisma.bank.findUnique({ where: { id: transaction.bankId } })
    const company = await prisma.company.findUnique({ where: { id: transaction.companyId } })
    const service = await prisma.service.findUnique({ where: { id: transaction.serviceId } })

    if (!bank || !company)
        return res.status(404).send()

    await prisma.transactions.upsert({
        where: { id },
        create: {
            title: title,
            type,
            createCuid: req.user.cuid,
            updatedCuid: req.user.cuid,
            value,
            content,
            bankId: bank.id,
            periodId: periodId,
            companyId: company.id,
            serviceId: service?.id,
        },
        update: {
            title,
            type,
            content,
            period: { connect: { id: periodId } },
            updatedBy: { connect: { cuid: req.user.cuid } }
        }
    })

    return res.send()
}

const updateTransaction = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)

    const { title, billed, type, value, fromAt, bankId, content, isDelete } = z
        .object({
            title: z.string().optional(),
            billed: z.boolean().optional(),
            type: z.enum(['INPUT', 'OUTPUT']).optional(),
            value: z.number().min(0).optional(),
            fromAt: z.coerce.date().optional(),
            bankId: z.coerce.number().optional(),
            content: z.string().optional(),
            isDelete: z.boolean().optional(),
        })
        .parse(req.body)

    if (bankId) {
        await prisma.transactions.update({
            where: { id },
            data: {
                title,
                billed,
                type,
                value,
                isDelete,
                fromAt,
                content,
                updatedBy: { connect: { cuid: req.user.cuid } },
                bank: { connect: { id: bankId } }
            }
        })
        return res.send()
    }
    await prisma.transactions.update({
        where: { id },
        data: {
            title,
            billed,
            type,
            value,
            fromAt,
            isDelete,
            content,
            updatedBy: { connect: { cuid: req.user.cuid } },
        }
    })

    return res.send()
}

const upsertTransactionPeriod = async (req: FastifyRequest, res: FastifyReply) => {
    const { transactionId, periodName } = z.object({ transactionId: z.coerce.number(), periodName: z.string() }).parse(req.body)
    const period = await prisma.period.findFirstOrThrow({ where: { name: periodName } })
    await prisma.transactions.update({
        where: { id: transactionId },
        data: {
            updatedBy: { connect: { cuid: req.user.cuid } },
            period: { connect: { id: period.id } }
        }
    })

    return res.send()
}

export {
    getTransactions,
    getTransaction,
    createOneTransaction,
    updateTransaction,
    upsertTransactionPeriod
}