import { User } from '@/models/user-model'
import { FastifyRequest, FastifyReply } from 'fastify'
import { hash, compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'
import config from '../../config'
import { prisma } from '@/plugins/prisma.plugins'
import { findOrCreatePeriod } from '@/services/period.services'

const getOrders = async (req: FastifyRequest, res: FastifyReply) => {
    const orderQuery = await prisma.order.findMany({ include: { client: {}, transactions: {} } })
    return res.send({ orders: orderQuery })
}

const getOrder = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)
    const orderQuery = await prisma.order.findUniqueOrThrow({
        where: { id },
        include: { client: {}, otherValues: {}, productsOnOrder: { include: { product: { include: { productsOnCart: {} } } } }, transactions: { include: { period: {} } } }
    })
    return res.send({ order: orderQuery })
}

const upsertOrder = async (req: FastifyRequest, res: FastifyReply) => {
    const { id, productsOnOrder, status, clientId, otherValues, payment } = z
        .object({
            id: z.coerce.number().default(0),
            clientId: z.coerce.number(),
            status: z.enum(['INIT', 'PROCESS', 'FINISHED']),
            productsOnOrder: z.array(z.object({
                id: z.coerce.number(),
                price: z.coerce.number(),
                quantity: z.coerce.number()
            })).nonempty(),
            otherValues: z.array(z.object({
                id: z.coerce.number().default(0),
                name: z.string(),
                price: z.coerce.number(),
            })).optional(),
            payment: z.object({
                method: z.enum(['INTEGRAL', 'INSTALLMENTS', 'OTHER']),
                total: z.coerce.number(),
                transactions: z.array(z.object({
                    id: z.coerce.number().default(0),
                    value: z.coerce.number(),
                    fromAt: z.coerce.date(),
                    periodId: z.coerce.number().optional()
                })).nonempty(),
            }),
        })
        .parse(req.body)

    const { client, ...order } = await prisma.order.upsert({
        where: { id },
        create: {
            assignedCuid: req.user.cuid,
            total: payment.total,
            status,
            clientId,
        },
        update: {
            assignedCuid: req.user.cuid,
            total: payment.total,
            status,
            clientId,
        },
        include: { client: {} }
    })

    await prisma.productsOnOrder.deleteMany({
        where: { orderId: order.id, productId: { notIn: productsOnOrder.map(({ id }) => id) } }
    })

    productsOnOrder.map(async ({ id, price, quantity }) => {
        if (quantity === 0) {
            await prisma.productsOnOrder.delete({ where: { productId_orderId: { orderId: order.id, productId: id } } })
        }
        await prisma.productsOnOrder.upsert({
            where: { productId_orderId: { orderId: order.id, productId: id } },
            create: {
                orderId: order.id,
                productId: id,
                price,
                quantity: Math.abs(quantity) * -1
            },
            update: {
                price,
                quantity: Math.abs(quantity) * -1
            },
            include: { product: {} }
        })
    })



    otherValues?.map(async ({ id, name, price }) => {
        await prisma.otherValues.upsert({
            where: { id },
            create: { name, price, orders: { connect: { id: order.id } } },
            update: { name, price }
        })
    })


    await prisma.transactions.deleteMany({
        where: { orderId: order.id, id: { notIn: payment.transactions.map(({ id }) => id) } }
    })

    const titleTransaction = ` [venda] [${order.id}] [${client.name}]`
    payment?.transactions?.map(async ({ id, value, fromAt, periodId }, index) => {
        const titleParcel = `${(index + 1)}/${payment.transactions.length}`
        const period = await findOrCreatePeriod({ periodAt: fromAt })
        await prisma.transactions.upsert({
            where: { id },
            create: {
                title: titleParcel + titleTransaction,
                type: 'INPUT',
                bankId: 1,
                companyId: 1,
                createCuid: req.user.cuid,
                updatedCuid: req.user.cuid,
                periodId: periodId ?? period.id,
                value: Math.abs(value),
                fromAt,
                orderId: order.id,
            },
            update: {
                title: titleParcel + titleTransaction,
                value: Math.abs(value),
                periodId,
                fromAt,
                isDelete: false
            }
        })
    })


    return res.status(201).send()
}

const deleteOrder = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)

    await prisma.order.delete({ where: { id } })

    return res.status(204).send()
}


export {
    getOrders,
    getOrder,
    upsertOrder,
    deleteOrder
}

