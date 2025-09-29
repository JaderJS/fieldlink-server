import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { db } from '@/plugins/prisma.plugins'

export const clientController = {
    getAll: async (req: FastifyRequest, res: FastifyReply) => {
        const clientsQuery = await db.client.findMany({
            include: {
                properties: true,
                orders: {
                    orderBy: { updatedAt: 'asc' },
                    include: {
                        transaction: {
                            // orderBy: { updatedAt: 'asc' },
                            include: { installments: true }
                            // include: { period: true }
                        }
                    }
                }
            }
        })

        const clients = clientsQuery.map((client) => ({
            ...client,
            summary: {
                openOrders: client.orders.filter((order) => order.transaction.installments.filter(i => i.billed).length),
                lastOrder: client.orders.at(0),
                firstOrder: client.orders.at(-1),
                total: {
                    spent: client.orders.reduce((acc, order) => acc + order.transaction.installments.filter(t => t.billed).reduce((acc_, i) => acc_ + i.value, 0), 0),
                    open: client.orders.reduce((acc, order) => acc + order.transaction.installments.filter(i => !i.billed).reduce((acc_, i) => acc_ + i.value, 0), 0),
                }
            }
        }))
        return res.send({ clients: clients })
    },
    getById: async (req: FastifyRequest, res: FastifyReply) => {
        const { id } = z.object({ id: z.coerce.number() }).parse(req.params)
        const clientQuery = await db.client.findUnique({ where: { id } })
        return res.send({ client: clientQuery })
    },
    upsert: async (req: FastifyRequest, res: FastifyReply) => {
        return res.status(501).send()
    }
}