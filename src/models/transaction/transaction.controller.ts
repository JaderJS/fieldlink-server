import { createEvent, deleteEvent } from '@/plugins/calendar'
import { db } from '@/plugins/prisma.plugins'
import { findOrCreatePeriod } from '@/services/period.services'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { formatEventDescription } from './transaction.services'

const getTransactions = async (req: FastifyRequest, res: FastifyReply) => {
    const transactionsQuery = await db.transactions.findMany({
        where: {
            isDelete: false,
            OR: [{
                order: { OR: [{ status: { flag: { notIn: ["BUDGET"] } } }] }
            }, {
                order: null
            }]
        },
        include: {
            createdBy: { omit: { password: true, isEnable: true, role: true } },
            updatedBy: { omit: { password: true, isEnable: true, role: true } },
            bank: true,
            order: { include: { client: true } },
            cart: { include: { supplier: true } },
            installments: { include: { period: true }, orderBy: [{ period: { order: 'asc' } }, { dueAt: 'desc' }] },
            company: true,
        },
        orderBy: { createdAt: 'desc' }
    })

    const transactions = transactionsQuery
        .sort((a, b) => {
            const periodA = a.installments[0]?.period.order ?? 0
            const periodB = b.installments[0].period.order ?? 0
            return periodB - periodA
        })
        .map((t) => ({
            ...t,
            total: t.total / 100,
            installments: t.installments.map((i) => ({ ...i, value: i.value / 100 }))
        }))

    return res.send({ transactions })
}

const getTransaction = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)
    const transactionQuery = await db.transactions.findUnique({
        where: { id },
        include: {
            createdBy: { omit: { password: true, isEnable: true, role: true } },
            updatedBy: { omit: { password: true, isEnable: true, role: true } },
            order: true,
            cart: true,
            bank: true,
            installments: { include: { period: true }, orderBy: [{ period: { order: 'asc' } }, { dueAt: 'desc' }] },
            company: true,
        },
    })
    const transaction = {
        ...transactionQuery,
        total: (transactionQuery?.total ?? 0) / 100,
        installments: transactionQuery?.installments.map((i) => ({ ...i, value: i.value / 100 }))
    }
    return res.send({ transaction: transaction })
}

const upsertTransaction = async (req: FastifyRequest, res: FastifyReply) => {
    const user = req.user
    const { id, title, total, description, type, eventId, hasNfe, bankId, isDelete, hasNotify, installments } = z
        .object({
            id: z.number().default(0),
            title: z.string().min(3),
            type: z.enum(['INPUT', 'OUTPUT']),
            total: z.coerce.number().transform(v => v * 100),
            description: z.string().nullish(),
            hasNfe: z.boolean().default(false),
            hasNotify: z.boolean().default(false),
            fileUrl: z.string().optional(),
            bankId: z.coerce.number().default(-1),
            companyId: z.number(),
            isDelete: z.boolean().default(false),
            eventId: z.string().nullish(),
            serviceId: z.number().nullish(),
            linkTo: z.coerce.number().nullish(),
            installments: z.array(z.object({
                id: z.coerce.number().default(-1),
                value: z.coerce.number().transform(v => v * 100),
                status: z.enum(["PENDING", "PAID", "PARTIAL", "CANCELLED", "REFUNDED"]),
                installmentsNumber: z.coerce.number(),
                paymentMethod: z.enum(["CARD", "PIX", "BOLETO", "TED", "CASH", "OTHER", "NOT_DECLARED"]),
                billed: z.coerce.boolean(),
                periodId: z.coerce.number(),
                dueAt: z.coerce.date(),
                paidAt: z.coerce.date().optional(),
                installmentsTotal: z.coerce.number().optional(),
                paymentReference: z.string().nullish(),
            })).default([])
        }).parse(req.body)


    const mutation = await db.$transaction(async (tx) => {

        let event: { id?: string } = { id: undefined }
        try {

            if (!hasNotify && eventId) {
                deleteEvent({ id: eventId })
            } else if (hasNotify) {
                const transactionQuery = await tx.transactions.findUniqueOrThrow({ where: { id }, include: { archives: true } })
                const slug = formatEventDescription({
                    title, billed: false, hasNfe, type, fromAt: transactionQuery.createdAt, value: 0, files: transactionQuery.archives.map(a => ({ name: a.title, pathUrl: a.pathUrl }))
                })
                event = await createEvent({ date: transactionQuery.createdAt, title: title, description: slug })
            }
        } catch (error) {
            return res.status(302).send({ url: `http://localhost:3333/google` })
        }

        const transaction = await tx.transactions.upsert({
            where: { id },
            create: {
                title,
                type,
                hasNfe,
                createCuid: user.cuid,
                updatedCuid: user.cuid,
                total: total,
                hasNotify,
                bankId: (await db.bank.findOrFallback(bankId)).id,
                companyId: (await db.company.findOrFallback(1))?.id!,
                eventId: event.id,
            },
            update: {
                title,
                type,
                hasNfe,
                updatedCuid: user.cuid,
                isDelete,
                bankId,
                hasNotify,
                eventId: event.id,
                total: total,
            }
        })

        await tx.installment.deleteMany({ where: { transactionId: transaction.id, id: { notIn: installments.map(i => i.id) } } })
        const installmentsPromise = installments.map(async ({ id: installmentId, ...installment }) => {
            return await tx.installment.upsert({
                where: { id: installmentId },
                create: {
                    ...installment,
                    transactionId: transaction.id,
                    createdCuid: user.cuid,
                    updatedCuid: user.cuid,
                    periodId: installment.periodId !== 0 ? installment.periodId : (await findOrCreatePeriod({ periodAt: installment.dueAt })).id,
                },
                update: {
                    ...installment,
                    updatedCuid: user.cuid,
                    periodId: installment.periodId !== 0 ? installment.periodId : (await findOrCreatePeriod({ periodAt: installment.dueAt })).id,
                }
            })
        })
        await Promise.all(installmentsPromise)

        return transaction
    })

    return res.status(200).send({ transaction: mutation })
}

const deleteTransaction = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)

    const transactionMutation = await db.transactions.update({
        where: { id },
        data: { isDelete: true }
    })
    return res.send({ transaction: transactionMutation })
}

const upsertTransactionPeriod = async (req: FastifyRequest, res: FastifyReply) => {
    const { transactionId, periodName } = z.object({ transactionId: z.coerce.number(), periodName: z.string() }).parse(req.body)
    const period = await db.period.findFirstOrThrow({ where: { name: periodName } })
    await db.transactions.update({
        where: { id: transactionId },
        data: {
            updatedBy: { connect: { id: req.user.cuid } },
        }
    })

    return res.send()
}

export {
    getTransactions,
    getTransaction,
    upsertTransaction,
    deleteTransaction,
    upsertTransactionPeriod
}