import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { db } from '@/plugins/prisma.plugins'
import { add } from 'date-fns'

export const clientController = {
    getAll: async (req: FastifyRequest, res: FastifyReply) => {
        const clientsQuery = await db.client.findMany({
            include: {
                properties: true,
                moreInfos: true,
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
        const clientQuery = await db.client.findUnique({ where: { id }, include: { properties: true, doc: true, moreInfos: true } })
        return res.send({ client: clientQuery })
    },
    upsert: async (req: FastifyRequest, res: FastifyReply) => {
        const { id, name, moreInfos, propertyIds, docId } = z.object({
            id: z.number().default(-1),
            name: z.string(),
            moreInfos: z.object({
                id: z.coerce.number().default(-1),
                state: z.string(),
                city: z.string(),
                email: z.email().optional(),
                phone: z.string().optional(),
                address: z.string().optional(),
                zipCode: z.string().optional(),
            }).optional(),
            propertyIds: z.array(z.coerce.number()).default([]),
            docId: z.string().optional()
        }).parse(req.body)

        const clientMutation = await db.client.upsert({
            where: { id },
            create: {
                name,
                docId: docId,
                property: "Desconhecido",
            },
            update: {
                name,
                docId: docId,
            },
            include: { moreInfos: true, }
        })

        if (moreInfos) {
            await db.clientsMoreInfos.upsert({
                where: { id: moreInfos?.id },
                create: {
                    city: moreInfos.city,
                    state: moreInfos.state,
                    email: moreInfos?.email,
                    phone: moreInfos?.phone,
                    address: moreInfos?.address,
                    zipCode: moreInfos?.zipCode,
                    clientId: clientMutation.id
                },
                update: {
                    city: moreInfos.city,
                    state: moreInfos.state,
                    email: moreInfos?.email,
                    phone: moreInfos?.phone,
                    address: moreInfos?.address,
                    zipCode: moreInfos?.zipCode,
                }
            })
        }

        const properties = await db.property.findMany({ where: { id: { in: propertyIds } } })
        const assignedProperties = properties.map(async (property) => {
            return await db.property.update({
                where: { id: property.id },
                data: { clientId: clientMutation.id }
            })
        })
        const result = await Promise.all(assignedProperties)

        return res.send({ client: clientMutation })
    },
    delete: async (req: FastifyRequest, res: FastifyReply) => {
        const { id } = z.object({ id: z.coerce.number() }).parse(req.params)

        const clientMutation = await db.client.delete({ where: { id } })

        return res.send({ client: clientMutation })
    }
}