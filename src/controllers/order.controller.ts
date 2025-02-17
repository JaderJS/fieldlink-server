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
        include: { client: {}, otherValues: {}, products: { include: { product: { include: { productsOnWork: {} } } } }, transactions: {} }
    })
    return res.send({ order: orderQuery })
}

const upsertOrder = async (req: FastifyRequest, res: FastifyReply) => {
    const { id, products, status, clientId, otherValues, payment } = z
        .object({
            id: z.coerce.number().default(0),
            clientId: z.coerce.number(),
            status: z.enum(['INIT', 'PROCESS', 'FINISHED']),
            products: z.array(z.object({
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
                transactions: z.array(z.object({
                    id: z.coerce.number().default(0),
                    value: z.coerce.number(),
                    fromAt: z.coerce.date(),
                    periodId: z.coerce.number().optional()
                })).nonempty(),
            }),
        })
        .transform((args) => {
            if (args.payment?.method !== 'INSTALLMENTS') {
                return { ...args, payment: { ...args.payment, transactions: args.payment.transactions } }
            }
            return args
        })
        .parse(req.body)

    const { client, ...order } = await prisma.order.upsert({
        where: { id },
        create: {
            assignedCuid: req.user.cuid,
            status,
            clientId,
            products: { createMany: { data: products.map(({ id, price, quantity }) => ({ productId: id, price, quantity })) } }
        },
        update: {
            assignedCuid: req.user.cuid,
            status,
            clientId,
        },
        include: { client: {} }
    })


    products.map(async ({ id, price, quantity }) => {
        if (quantity === 0) {
            await prisma.productsOnOrder.delete({ where: { productId_orderId: { orderId: order.id, productId: id } } })
        }
        await prisma.productsOnOrder.upsert({
            where: { productId_orderId: { orderId: order.id, productId: id } },
            create: { orderId: order.id, productId: id, price, quantity },
            update: { price, quantity },
            include: { product: {} }
        })
    })
    await prisma.productsOnOrder.deleteMany({
        where: { orderId: order.id, productId: { notIn: products.map(({ id }) => id) } }
    })

    otherValues?.forEach(async ({ id, name, price }) => {
        await prisma.otherValues.upsert({
            where: { id },
            create: { name, price, orders: { connect: { id: order.id } } },
            update: { name, price }
        })
    })

    const titleTransaction = ` [venda] [${order.id}] [${client.name}]`
    payment?.transactions?.map(async ({ id, value, fromAt, periodId }, index) => {
        const titleParcel = `${(index + 1)}/${payment.transactions.length}`
        const period = await findOrCreatePeriod({ periodAt: fromAt })
        const t = await prisma.transactions.upsert({
            where: { id },
            create: {
                title: titleParcel + titleTransaction,
                type: 'INPUT',
                bankId: 1,
                companyId: 1,
                createCuid: req.user.cuid,
                updatedCuid: req.user.cuid,
                periodId: periodId ?? period.id,
                value,
                fromAt,
                orderId: order.id,
            },
            update: {
                title: titleParcel + titleTransaction,
                value,
                periodId,
                fromAt,
                isDelete: false
            }
        })
        console.log(t)
    })
    await prisma.transactions.deleteMany({
        where: { orderId: order.id, id: { notIn: payment.transactions.map(({ id }) => id) } }
    })

    return res.status(201).send()
}


export {
    getOrders,
    getOrder,
    upsertOrder
}

