import { createEvent, deleteEvent } from '@/plugins/calendar'
import { db } from '@/plugins/prisma.plugins'
import { findOrCreatePeriod } from '@/services/period.services'
import { Transactions } from "@/../prisma/generated/client"
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const getInstallments = async (req: FastifyRequest, res: FastifyReply) => {

    const params = z.object({
        transaction: z.object({ id: z.coerce.number() }).optional()
    }).optional().parse(req.query)
    

    const installmentsQuery = await db.installment.findMany({
        where: params ? {
            transactionId: params.transaction?.id
        } : undefined,
        include: { period: true, transaction: { include: { bank: true } } },
        orderBy: [{ period: { order: 'desc' } }, { dueAt: 'desc' }],
    })
    const installments = installmentsQuery.map(installment => ({
        ...installment,
        value: installment.value / 100,
    }))
    return res.send({ installments: installments })
}

const getInstallment = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)
    const installmentQuery = await db.installment.findUniqueOrThrow({ where: { id } })
    return res.send({ installment: installmentQuery })
}

const upsertInstallment = async (req: FastifyRequest, res: FastifyReply) => {
    const user = req.user
    const { id, value, status, installmentsNumber, paymentMethod, billed, periodId, transactionId, dueAt, paidAt, installmentsTotal } = z.object({
        id: z.coerce.number().default(-1),
        value: z.coerce.number(),
        status: z.enum(["PENDING", "PAID", "PARTIAL", "CANCELLED", "REFUNDED"]),
        installmentsNumber: z.coerce.number(),
        paymentMethod: z.enum(["CARD", "PIX", "BOLETO", "TED", "CASH", "OTHER", "NOT_DECLARED"]),
        billed: z.coerce.boolean(),
        periodId: z.coerce.number(),
        transactionId: z.coerce.number(),
        dueAt: z.coerce.date(),
        paidAt: z.coerce.date().optional(),
        installmentsTotal: z.coerce.number().optional(),
    }).parse(req.body)


    const mutation = await db.$transaction(async (tx) => {
        return await tx.installment.upsert({
            where: { id },
            create: {
                transactionId,
                value,
                dueAt,
                billed,
                paidAt,
                status,
                installmentsNumber,
                createdCuid: user.cuid,
                updatedCuid: user.cuid,
                periodId: (await tx.period.findOrFallbackCurrentMonth(periodId)).id,
            },
            update: {
                value,
                dueAt,
                billed,
                paidAt,
                status,
                installmentsNumber,
                updatedCuid: user.cuid,
                periodId: periodId !== 0 ? periodId : (await findOrCreatePeriod({ periodAt: dueAt })).id,
            }
        })
    })

    return res.status(200).send({ installment: mutation })
}

const deleteInstallment = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)
    await db.installment.delete({ where: { id } })

    return res.status(204).send()
}

export {
    getInstallments,
    getInstallment,
    upsertInstallment,
    deleteInstallment
}