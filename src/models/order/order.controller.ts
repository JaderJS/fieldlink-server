import { db } from '@/plugins/prisma.plugins'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const getOrders = async (req: FastifyRequest, res: FastifyReply) => {

    const ordersQuery = await db.order.findMany({
        include: {
            category: true,
            works: true,
            sales: {
                include: {
                    productsOnSale: {
                        include: { product: true }
                    }
                }
            }
        }
    })

    return res.send({ orders: ordersQuery })
}

const getOrderById = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({
        id: z.coerce.number()
    }).parse(req.params)

    const orderQuery = await db.order.findUniqueOrThrow({
        where: { id }, include: {
            client: true,
            category: true,
            works: {
                include: {
                    sales: {
                        include: { productsOnSale: { include: { product: true } } }
                    }
                }
            },
            sales: {
                where: { works: { none: {} } },
                include: {
                    productsOnSale: {
                        include: { product: true }
                    }
                }
            }
        }
    })

    return res.send({ order: orderQuery })
}

const upsertOrder = async (req: FastifyRequest, res: FastifyReply) => {

    const { id, title, clientId, total, sales, works } = z.object({
        id: z.number().default(0),
        title: z.string(),
        clientId: z.coerce.number().default(0),
        total: z.number(),
        sales: z.array(z.object({
            id: z.coerce.number().default(0),
            total: z.coerce.number(),
            productsOnSale: z.array(z.object({
                price: z.coerce.number(),
                quantity: z.coerce.number(),
                product: z.object({ id: z.coerce.number() })
            })).min(1)
        })).default([]),
        works: z.array(z.object({
            id: z.coerce.number().default(0),
            total: z.coerce.number(),
            sales: z.array(z.object({
                id: z.coerce.number().default(0),
                total: z.coerce.number(),
                productsOnSale: z.array(z.object({
                    price: z.coerce.number(),
                    quantity: z.coerce.number(),
                    product: z.object({ id: z.coerce.number() })
                })).min(1)
            })).default([])
        })).default([])
    }).parse(req.body)

    const mutation = await db.$transaction(async (tx) => {

        const order = await tx.order.upsert({
            where: { id },
            create: {
                title,
                total,
                client: { connectOrCreate: { where: { id: clientId }, create: { name: "Desconhecido" } } },
                category: { connectOrCreate: { where: { name: "Previsto" }, create: { name: "Previsto" }, } }
            },
            update: { title, total },
        })

        await tx.sale.deleteMany({ where: { orderId: order.id, id: { notIn: sales.map((s) => s.id) } } })
        for (const sale of sales) {
            const saleMutation = await tx.sale.upsert({
                where: { id: sale.id },
                create: { total: sale.total, orderId: order.id },
                update: { total: sale.total, orderId: order.id }
            })

            await tx.productsOnSales.deleteMany({ where: { saleId: sale.id, productId: { notIn: sale.productsOnSale.map((p) => p.product.id) } } })
            for (const productOnSale of sale.productsOnSale) {
                await tx.productsOnSales.upsert({
                    where: { saleId_productId: { saleId: saleMutation.id, productId: productOnSale.product.id } },
                    create: {
                        productId: productOnSale.product.id,
                        saleId: saleMutation.id,
                        price: productOnSale.price,
                        quantity: productOnSale.quantity,
                    },
                    update: {
                        price: productOnSale.price,
                        quantity: productOnSale.quantity,
                    }
                })
            }
        }

        await tx.work.deleteMany({ where: { orderId: order.id, id: { notIn: works.map(w => w.id) } } })
        for (const work of works) {
            const workMutation = await tx.work.upsert({
                where: { id: work.id },
                create: {
                    orderId: order.id,
                    total: work.total
                },
                update: {
                    total: work.total
                }
            })

            await tx.sale.deleteMany({ where: { works: { some: { id: workMutation.id } }, orderId: order.id, id: { notIn: work.sales.map(s => s.id) } } })
            for (const sale of work.sales) {
                const saleMutation = await tx.sale.upsert({
                    where: { id: sale.id },
                    create: { total: sale.total, orderId: order.id, works: { connect: { id: workMutation.id } } },
                    update: { total: sale.total, orderId: order.id }
                })
                for (const productOnSale of sale.productsOnSale) {
                    await tx.productsOnSales.upsert({
                        where: { saleId_productId: { saleId: saleMutation.id, productId: productOnSale.product.id } },
                        create: {
                            productId: productOnSale.product.id,
                            saleId: saleMutation.id,
                            price: productOnSale.price,
                            quantity: productOnSale.quantity,
                        },
                        update: {
                            price: productOnSale.price,
                            quantity: productOnSale.quantity,
                        }
                    })
                }
            }

        }
        return order
    }, { timeout: 10000 })

    return res.send({ order: mutation })
}

export {
    getOrders,
    upsertOrder,
    getOrderById
}