import { prisma } from '@/plugins/prisma.plugins'
import { add } from 'date-fns'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import config from '../../config'
import { Prisma } from '@prisma/client'
import { applyFilters } from '@/core/filter'

const getNotification = async (req: FastifyRequest, res: FastifyReply) => {
    const where = await applyFilters<Prisma.UserWhereInput>({
        appliedFiltersInput: req.query as { [key: string]: unknown },
        availableFilters: {
            cuid: async ({ filter }) => {
                return {
                    where: {
                        cuid: {
                            equals: String(filter),
                        },
                    },
                };
            },
        },
    })

    const fromAt = add(new Date(), { days: 1 })

    const transactionQuery = await prisma.transactions.findMany({
        where: {
            isDelete: false,
            billed: false,
            fromAt: {
                lte: fromAt
            }
        },
        select: {
            id: true,
            title: true,
            value: true,
            serviceId: true,
            bankId: true,
            orderId: true,
            fromAt: true,
        }
    })

    const notifications = transactionQuery.map(({ id, title, value, serviceId, bankId, orderId }) => {

        return {
            title,
            link: config.URL_FRONT + `/adm/transaction/${id}`,
            description: `
            ${value.toLocaleString('pt-BR', { style: "currency", currency: 'BRL' })}
            `.trim(),
            fromAt
        }
    })

    return res.send({ notifications: notifications })
}


export {
    getNotification,
}