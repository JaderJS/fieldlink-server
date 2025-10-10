import { db } from '@/plugins/prisma.plugins'
import { add, differenceInCalendarDays } from 'date-fns'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const getNotification = async (req: FastifyRequest, res: FastifyReply) => {

    const now = new Date()

    const transactionQuery = await db.transactions.findMany({
        where: {
            isDelete: false,
            OR: [{
                order: { OR: [{ status: { flag: { notIn: ["BUDGET"] } } }] }
            }, {
                order: null
            }]
        },
        include: {
            installments: {
                where: {
                    dueAt: {
                        lte: now
                    },
                    billed: false
                },
                select: {
                    id: true,
                    value: true,
                    dueAt: true,
                    status: true,
                    installmentsNumber: true,
                    transactionId: true
                }
            },
            bank: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' }
    })

    const notifications = transactionQuery.flatMap(tx =>
        tx.installments.map(inst => {
            const valueNumber = Number(inst.value) / 100
            return {
                id: `installment-${inst.id}`,
                kind: 'installment',
                transactionId: tx.id,
                installmentId: inst.id,
                title: tx.title,
                bank: tx.bank ?? null,
                amount: valueNumber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                amountRaw: inst.value,
                dueAt: inst.dueAt,
                daysLeft: differenceInCalendarDays(new Date(inst.dueAt), now), // negativo = vencida
                status: inst.status,
                link: `/adm/installments/${inst.id}`,
            }
        })
    )

    return res.send({ notifications: notifications })
}


export {
    getNotification,
}