import { createEvent, deleteEvent } from '@/plugins/calendar'
import { oauth2Client } from '@/plugins/google'
import { db } from '@/plugins/prisma.plugins'
import { findOrCreatePeriod } from '@/services/period.services'
import { Transactions } from '@prisma/client'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const getTransactions = async (req: FastifyRequest, reply: FastifyReply) => {
    const transactions = await db.transactions.findMany({
        where: { isDelete: false },
        include: {
            createdBy: { omit: { password: true, isEnable: true, role: true } },
            updatedBy: { omit: { password: true, isEnable: true, role: true } },
            bank: {},
            company: {},
            period: {},
            cart: { include: { supplier: {} } },
            order: { include: { client: {} } },
            service: { include: { client: {} } },
        },
        orderBy: [{ period: { order: 'desc' } }, { id: 'asc' },]
    })
    return reply.send({ transactions })
}

const getTransaction = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)
    const transaction = await db.transactions.findUnique({
        where: { id },
        include: {
            createdBy: { omit: { password: true, isEnable: true, role: true } },
            updatedBy: { omit: { password: true, isEnable: true, role: true } },
            bank: {},
            company: {},
            period: {},
            cart: {},
            service: {},
            groupTransactions: { include: { period: true } },
            rootTransaction: { include: { groupTransactions: { include: { period: true } }, period: true } }
        },
    })

    return reply.send({ transaction })
}

const upsertTransaction = async (req: FastifyRequest, res: FastifyReply) => {
    const { id, title, description, type, periodId, value, content, fromAt, eventId, billed, hasNfe, bankId, isDelete } = z
        .object({
            id: z.number().default(0),
            title: z.string().min(3),
            type: z.enum(['INPUT', 'OUTPUT']),
            description: z.string().nullish(),
            hasNfe: z.boolean().default(false),
            value: z.coerce.number(),
            content: z.string(),
            billed: z.boolean().default(false),
            hasNotify: z.boolean().default(false),
            fileUrl: z.string().optional(),
            periodId: z.coerce.number(),
            fromAt: z.coerce.date(),
            bankId: z.coerce.number(),
            companyId: z.number(),
            isDelete: z.boolean().default(false),
            eventId: z.string().nullish(),
            serviceId: z.number().nullish(),
        })
        .transform(({ value, type, ...args }) => ({ ...args, type, value: type === 'OUTPUT' ? Math.abs(value) * -1 : Math.abs(value) }))
        .parse(req.body)

    // if (eventId) {
    //     // deleteEvent({ id: eventId })
    // }

    // const slug = createTransactionSlug({ title, type, content, value, billed, fromAt, hasNfe })
    // const event = await createEvent({ date: fromAt, title: title, description: slug })

    await db.transactions.upsert({
        where: { id },
        create: {
            title,
            type,
            billed,
            description,
            createCuid: req.user.cuid,
            updatedCuid: req.user.cuid,
            value,
            content,
            periodId: periodId !== 0 ? periodId : (await findOrCreatePeriod({ periodAt: fromAt })).id,
            fromAt,
            bankId,
            companyId: 1,
            // eventId: event.id
        },
        update: {
            title,
            type,
            billed,
            description,
            updatedCuid: req.user.cuid,
            value,
            content,
            periodId,
            isDelete,
            fromAt,
            bankId,
            // eventId: event.id
        }
    })

    return res.status(201).send()
}

const upsertTransactionPeriod = async (req: FastifyRequest, res: FastifyReply) => {
    const { transactionId, periodName } = z.object({ transactionId: z.coerce.number(), periodName: z.string() }).parse(req.body)
    const period = await db.period.findFirstOrThrow({ where: { name: periodName } })
    await db.transactions.update({
        where: { id: transactionId },
        data: {
            updatedBy: { connect: { cuid: req.user.cuid } },
            period: { connect: { id: period.id } }
        }
    })

    return res.send()
}

const createTransactionSlug = ({ title, type, description, value, billed, fromAt, hasNfe }: Partial<Transactions>) => {
    const transactionType = type === 'INPUT' ? 'Entrada' : 'Saída'
    const billedStatus = billed ? 'Faturado' : 'Não faturado'
    const nfeStatus = hasNfe ? 'Com NFE' : 'Sem NFE'
    const formattedDate = fromAt?.toLocaleString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })

    return `
    Automação Fieldlink - Transação de ${transactionType}
    Título: ${title}
    Descrição: ${description || 'Sem descrição'}
    Valor: R$${value?.toFixed(2)}
    Status do Faturamento: ${billedStatus}
    Data e Hora: ${formattedDate}
    Status da NFE:* ${nfeStatus}
    `
}

export {
    getTransactions,
    getTransaction,
    upsertTransaction,
    upsertTransactionPeriod
}