import { db } from '@/plugins/prisma.plugins'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import transactions from '../transaction/transactions.routes'
import { content } from 'googleapis/build/src/apis/content'
import { differenceInHours } from 'date-fns'
import { Prisma } from '@prisma/client'

const getOrders = async (req: FastifyRequest, res: FastifyReply) => {

    const ordersQuery = await db.order.findMany({
        include: {
            category: true,
            works: true,
            client: true,
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
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)

    const orderQuery = await db.order.findUniqueOrThrow({
        where: { id }, include: {
            client: true,
            category: true,
            works: {
                include: {
                    sales: {
                        include: { productsOnSale: { include: { product: { include: { categories: true } } } } }
                    }
                }
            },
            transaction: { include: { installments: { include: { period: true } } } },
            sales: {
                where: { works: { none: {} } },
                include: {
                    productsOnSale: {
                        include: { product: { include: { categories: true } } }
                    }
                }
            }
        }
    })
    return res.send({ order: { ...orderQuery, discount: orderQuery.discount / 100 } })
}

const upsertOrder = async (req: FastifyRequest, res: FastifyReply) => {
    const user = req.user
    const { id, title, clientId, total, flag, discount, sales, works, otherValues, date, transaction } = z.object({
        id: z.number().default(0),
        title: z.string(),
        clientId: z.coerce.number().default(-1),
        total: z.coerce.number(),
        discount: z.coerce.number(),
        flag: z.string(),
        date: z.object({
            start: z.coerce.date(),
            finish: z.coerce.date()
        }).optional().transform((args) => {
            if (!args?.start || !args?.finish) return
            const hours = differenceInHours(args.finish, args.start)
            return ({ ...args, hours })
        }),
        sales: z.array(z.object({
            id: z.coerce.number().default(0),
            total: z.coerce.number(),
            productsOnSale: z.array(z.object({
                price: z.coerce.number(),
                quantity: z.coerce.number(),
                product: z.object({ id: z.coerce.number() })
            })).min(1)
        })).default([]),
        transaction: z.object({
            id: z.coerce.number().default(-1),
            title: z.string().min(3),
            type: z.enum(['INPUT', 'OUTPUT']),
            isDelete: z.boolean().default(false),
            hasNfe: z.boolean().default(false),
            total: z.coerce.number(),
            companyId: z.coerce.number(),
            bankId: z.coerce.number(),
            hasNotify: z.coerce.boolean(),
            installments: z.array(z.object({
                id: z.coerce.number().default(-1),
                value: z.coerce.number(),
                status: z.enum(["PENDING", "PAID", "PARTIAL", "CANCELLED", "REFUNDED"]),
                installmentsNumber: z.coerce.number(),
                paymentMethod: z.enum(["CARD", "PIX", "BOLETO", "TED", "CASH", "OTHER", "NOT_DECLARED"]),
                billed: z.coerce.boolean(),
                periodId: z.coerce.number().default(-1),
                transactionId: z.coerce.number().default(-1),
                dueAt: z.coerce.date(),
                paidAt: z.coerce.date().optional(),
                installmentsTotal: z.coerce.number().optional(),
                paymentReference: z.string().optional(),
            })).default([]),
            content: z.record(z.string(), z.any())
        }),
        works: z.array(z.object({
            id: z.coerce.number().default(-1),
            title: z.string(),
            total: z.coerce.number(),
            content: z.record(z.string(), z.any()).optional(),
            archives: z.array(z.object({
                title: z.string(),
                type: z.string(),
                path: z.string(),
                pathUrl: z.string(),
                description: z.string().optional()
            })).default([]),
            otherValues: z.array(z.object({
                id: z.coerce.number().default(-1),
                name: z.string(),
                price: z.coerce.number()
            })).default([]),
            sales: z.array(z.object({
                id: z.coerce.number().default(-1),
                total: z.coerce.number(),
                productsOnSale: z.array(z.object({
                    price: z.coerce.number(),
                    quantity: z.coerce.number(),
                    product: z.object({ id: z.coerce.number() })
                })).min(1)
            })).default([]),
            date: z.object({
                start: z.coerce.date(),
                finish: z.coerce.date(),
            }).optional().transform((args) => {
                if (!args?.start || !args?.finish) return
                const hours = differenceInHours(args.finish, args.start)
                return ({ ...args, hours })
            }),
        })).default([]),
        otherValues: z.array(z.object({
            id: z.coerce.number().default(-1),
            name: z.string(),
            price: z.coerce.number()
        })).default([]),
    }).parse(req.body)


    const mutation = await db.$transaction(async (tx) => {

        const transactionMutation = await tx.transactions.upsert({
            where: { id: transaction.id },
            include: { installments: true },
            create: {
                title: transaction.title,
                type: "INPUT",
                bankId: transaction.bankId,
                companyId: 1,
                createCuid: user.cuid,
                updatedCuid: user.cuid,
            },
            update: {
                title: transaction.title,
                bankId: transaction.bankId,
                updatedCuid: user.cuid,
            }
        })

        // for (const installment of transaction.installments) {
        //     await tx.installment.upsert({
        //         where: { id: installment.id },
        //         create: {
        //             dueAt: installment.dueAt,
        //             installmentsNumber: 1,
        //             value: installment.value,
        //             transactionId: transactionMutation.id,
        //             billed: false,
        //             status: installment.status,
        //             createdCuid: user.cuid,
        //             updatedCuid: user.cuid,
        //             periodId: (await tx.period.findOrFallbackCurrentMonth(installment.periodId)).id
        //         },
        //         update: {
        //             dueAt: installment.dueAt,
        //             value: installment.value,
        //             billed: false,
        //             status: installment.status,
        //             updatedCuid: user.cuid,
        //             periodId: (await tx.period.findOrFallbackCurrentMonth(installment.periodId)).id
        //         }
        //     })
        // }
        await tx.installment.deleteMany({ where: { transactionId: transactionMutation.id, id: { notIn: transaction.installments.map(i => i.id) } } })
        const installmentsPromise = Promise.all(transaction.installments.map(async (installment) => {
            return tx.installment.upsert({
                where: { id: installment.id },
                create: {
                    dueAt: installment.dueAt,
                    installmentsNumber: 1,
                    value: installment.value,
                    transactionId: transactionMutation.id,
                    billed: installment.billed,
                    status: installment.status,
                    createdCuid: user.cuid,
                    updatedCuid: user.cuid,
                    periodId: (await tx.period.findOrFallbackCurrentMonth(installment.periodId)).id
                },
                update: {
                    dueAt: installment.dueAt,
                    value: installment.value,
                    billed: installment.billed,
                    status: installment.status,
                    updatedCuid: user.cuid,
                    periodId: (await tx.period.findOrFallbackCurrentMonth(installment.periodId)).id
                }
            })
        }))

        const order = await tx.order.upsert({
            where: { id },
            create: {
                title,
                total,
                clientId: (await tx.client.findOrFallback(clientId)).id,
                categoryId: (await tx.categoryOrder.findOrFallback(-1)).id,
                transactionId: transactionMutation.id,
                updatedByCuid: user.cuid,
                date: date ?? Prisma.JsonNull,
                otherValues,
            },
            update: {
                title,
                total,
                flag,
                discount: discount * 100,
                otherValues: otherValues,
                updatedBy: { connect: { id: user.cuid } },
                client: { connect: { id: clientId } },
                date: date ?? Prisma.JsonNull
            },
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

        // for (const work of works) {
        //     const workMutation = await tx.work.upsert({
        //         where: { id: work.id },
        //         create: {
        //             orderId: order.id,
        //             content: work.content,
        //             otherValues: work.otherValues,
        //             total: work.total,
        //             title: work.title,
        //             updatedByCuid: user.cuid,
        //             date: work.date ?? Prisma.JsonNull,
        //             archives: work.archives
        //         },
        //         update: {
        //             total: work.total,
        //             otherValues: work.otherValues,
        //             updatedByCuid: user.cuid,
        //             content: work.content,
        //             date: work.date ?? Prisma.JsonNull,
        //             archives: work.archives
        //         }
        //     })

        //     await tx.sale.deleteMany({ where: { works: { some: { id: workMutation.id } }, orderId: order.id, id: { notIn: work.sales.map(s => s.id) } } })
        //     for (const sale of work.sales) {
        //         const saleMutation = await tx.sale.upsert({
        //             where: { id: sale.id },
        //             create: { total: sale.total, orderId: order.id, works: { connect: { id: workMutation.id } } },
        //             update: { total: sale.total, orderId: order.id }
        //         })
        //         for (const productOnSale of sale.productsOnSale) {
        //             await tx.productsOnSales.upsert({
        //                 where: { saleId_productId: { saleId: saleMutation.id, productId: productOnSale.product.id } },
        //                 create: {
        //                     productId: productOnSale.product.id,
        //                     saleId: saleMutation.id,
        //                     price: productOnSale.price,
        //                     quantity: productOnSale.quantity,
        //                 },
        //                 update: {
        //                     price: productOnSale.price,
        //                     quantity: productOnSale.quantity,
        //                 }
        //             })
        //         }
        //     }
        // }

        await tx.work.deleteMany({ where: { orderId: order.id, id: { notIn: works.map(w => w.id) } } })
        const worksPromise = Promise.all(works.map(async (work) => {
            const workMutation = await tx.work.upsert({
                where: { id: work.id },
                create: {
                    orderId: order.id,
                    content: work.content,
                    otherValues: work.otherValues,
                    total: work.total,
                    title: work.title,
                    updatedByCuid: user.cuid,
                    date: work.date ?? Prisma.JsonNull,
                    archives: work.archives
                },
                update: {
                    total: work.total,
                    otherValues: work.otherValues,
                    updatedByCuid: user.cuid,
                    content: work.content,
                    date: work.date ?? Prisma.JsonNull,
                    archives: work.archives
                }
            })

            const incomingWorkSalesIds = work.sales.map(s => s.id).filter(Boolean)
            await tx.sale.deleteMany({
                where: {
                    works: { some: { id: workMutation.id } },
                    orderId: order.id,
                    id: { notIn: incomingWorkSalesIds }
                }
            })

            await Promise.all(work.sales.map(async (sale) => {
                const saleMutation = await tx.sale.upsert({
                    where: { id: sale.id },
                    create: { total: sale.total, orderId: order.id, works: { connect: { id: workMutation.id } } },
                    update: { total: sale.total, orderId: order.id }
                })

                await tx.productsOnSales.deleteMany({ where: { saleId: saleMutation.id } });
                if (sale.productsOnSale.length) {
                    const bulk = sale.productsOnSale.map(p => ({
                        saleId: saleMutation.id,
                        productId: p.product.id,
                        price: p.price,
                        quantity: p.quantity
                    }))
                    await tx.productsOnSales.createMany({ data: bulk, skipDuplicates: true });
                }
            }))

        }))

        await Promise.all([installmentsPromise, worksPromise])

        return order
    }, { timeout: 15000 })

    return res.send({ order: mutation })
}

const deleteOrder = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)

    await db.order.delete({ where: { id } })

    return res.status(204).send()
}

const sendEmailOrder = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)
    const { to, subject, text, html } = z.object({ to: z.email(), subject: z.email(), text: z.string().nullish(), html: z.string().nullish() }).parse(req.body)

    const order = await db.order.findUniqueOrThrow({
        where: { id },
        include: {
            works: {},
            sales: {},
            client: {},
            // transactions: { include: { period: true } }
        }
    })

    return res.send()
}
export {
    getOrders,
    upsertOrder,
    getOrderById,
    deleteOrder,

    sendEmailOrder
}