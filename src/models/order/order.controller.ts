import { db } from '@/plugins/prisma.plugins'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { differenceInHours } from 'date-fns'
import { Prisma } from "@/../prisma/generated/client"
import { resend } from '@/core/email'
import { OrderTemplate } from '@/html/order/order'
import { renderToBuffer } from '@react-pdf/renderer'
import { Nf } from '@/html/order/template.nf'

const getOrders = async (req: FastifyRequest, res: FastifyReply) => {

    const ordersQuery = await db.order.findMany({
        include: {
            category: true,
            status: true,
            works: true,
            client: true,
            sales: {
                include: {
                    productsOnSale: {
                        include: { product: true }
                    }
                }
            }
        },
        orderBy: [{ status: { ordering: 'asc' } }, { createdAt: 'asc' }]
    })

    const orders = ordersQuery.map(order => ({
        ...order,
        flag: order.status?.name || "Desconhecido",
        total: (order.discount === 0 ? order.total : (order.total * (1 - order.discount / 100))) / 100,
        discount: order.discount / 100
    }))

    return res.send({ orders: orders })
}

const getOrderById = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)

    const orderQuery = await db.order.findUniqueOrThrow({
        where: { id }, include: {
            client: true,
            status: true,
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

    return res.send({
        order: {
            ...orderQuery,
            status: orderQuery.status,
            discount: orderQuery.discount / 100,
            total: orderQuery.total / 100,
            sales: orderQuery.sales.map(sale => ({
                ...sale,
                content: {}
            })),
            transaction: {
                ...orderQuery.transaction,
                installments: orderQuery.transaction.installments.map((installment) => ({
                    ...installment,
                    value: installment.value / 100
                }))
            }
        }
    })
}

const upsertOrder = async (req: FastifyRequest, res: FastifyReply) => {
    const user = req.user
    const { id, title, clientId, total, flag, discount, statusId, sales, works, otherValues, date, transaction } = z.object({
        id: z.number().default(-1),
        statusId: z.coerce.number().default(-1),
        title: z.string(),
        clientId: z.coerce.number().default(-1),
        total: z.coerce.number().transform(arg => arg * 100),
        discount: z.coerce.number().transform(arg => arg * 100),
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
                value: z.coerce.number().transform(prop => prop * 100),
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
            open: z.coerce.boolean().default(true),
            orderN: z.coerce.number().default(0),
            disabled: z.coerce.boolean().default(false),
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
                total: total,
                title: transaction.title,
                type: "INPUT",
                bankId: transaction.bankId,
                companyId: 1,
                createCuid: user.cuid,
                updatedCuid: user.cuid,
            },
            update: {
                total: total,
                title: transaction.title,
                bankId: transaction.bankId,
                updatedCuid: user.cuid,
            }
        })

        await tx.installment.deleteMany({ where: { transactionId: transactionMutation.id, id: { notIn: transaction.installments.map(i => i.id) } } })
        const installmentsPromise = Promise.all(transaction.installments.map(async (installment, index) => {
            return tx.installment.upsert({
                where: { id: installment.id },
                create: {
                    dueAt: installment.dueAt,
                    installmentsNumber: index,
                    value: installment.value,
                    transactionId: transactionMutation.id,
                    billed: installment.billed,
                    status: installment.billed ? 'PAID' : installment.status,
                    createdCuid: user.cuid,
                    updatedCuid: user.cuid,
                    periodId: (await tx.period.findOrFallbackCurrentMonth(installment.periodId)).id
                },
                update: {
                    installmentsNumber: index,
                    dueAt: installment.dueAt,
                    value: installment.value,
                    billed: installment.billed,
                    status: installment.billed ? 'PAID' : installment.status,
                    updatedCuid: user.cuid,
                    periodId: (await tx.period.findOrFallbackCurrentMonth(installment.periodId)).id
                }
            })
        }))

        const order = await tx.order.upsert({
            where: { id },
            create: {
                title,
                orderStatusId: (await tx.orderStatus.findOrFallback(statusId)).id,
                discount: discount,
                total: total,
                clientId: (await tx.client.findOrFallback(clientId)).id,
                categoryId: (await tx.categoryOrder.findOrFallback(-1)).id,
                transactionId: transactionMutation.id,
                updatedByCuid: user.cuid,
                date: date ?? Prisma.JsonNull,
                otherValues,
            },
            update: {
                title,
                total: total,
                flag,
                discount: discount,
                otherValues: otherValues,
                status: { connect: { id: statusId } },
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
                    disabled: work.disabled,
                    orderN: work.orderN,
                    open: work.open,
                    updatedByCuid: user.cuid,
                    date: work.date ?? Prisma.JsonNull,
                    archives: work.archives
                },
                update: {
                    total: work.total,
                    otherValues: work.otherValues,
                    updatedByCuid: user.cuid,
                    content: work.content,
                    disabled: work.disabled,
                    orderN: work.orderN,
                    open: work.open,
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

    const order = await db.order.findUnique({ where: { id }, include: { transaction: true } })

    if (!order) {
        return res.status(404).send({ msg: "Order not founded" })
    }

    await db.order.delete({ where: { id } })

    return res.status(204).send()
}

const sendEmailOrder = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)
    const { to, subject } = z.object({
        to: z.union([z.email()]),
        subject: z.string(),
    }).parse(req.body)

    const order = await db.order.findUniqueOrThrow({
        where: { id },
        include: {
            works: {
                include: {
                    sales: {
                        include: {
                            productsOnSale: {
                                include: { product: { include: { categories: true } } }
                            }
                        }
                    }
                }
            },
            sales: {
                include: {
                    productsOnSale: {
                        include: { product: { include: { categories: true } } }
                    }
                }
            },
            client: {
                include: {
                    properties: {
                        include: {
                            stations: true
                        }
                    }
                }
            },
            transaction: {
                include: {
                    bank: true,
                    company: true,
                    installments: true
                }
            }
        }
    })

    const itens = order.sales.flatMap((sale) =>
        sale.productsOnSale.map((pos) => ({
            name: pos.product.name,
            qtd: pos.quantity ?? 1,
            value: pos.price ?? 0,
            und: "und" as const,
        }))
    );

    const pdfBuffer = await renderToBuffer(
        Nf({
            emitter: {
                name: order.transaction?.company?.name ?? "Link Network",
                cnpj: order.transaction?.company?.cnpj ?? "00.000.000/0000-00",
            },
            client: {
                name: order.client?.name ?? "Cliente não identificado",
                property: order.client?.properties?.[0]?.title ?? "—",
                state: "MT",
                cnpj: "000.000.000/0000-00",
                town: order.client?.properties?.[0]?.city ?? "—",
            },
            type: "Ordem de Serviço",
            itens,
            discount: order.discount
                ? { percent: order.discount, value: (order.total * order.discount) / 100 }
                : { percent: 0, value: 0 },
            obs: "",
        })
    );

    const resp = await resend.emails.send({
        from: 'fieldlink@resend.dev',
        to: to,
        subject: subject,
        react: OrderTemplate({ order }),
        attachments: [{
            filename: `${order.title} [${order.id}] [${order.client.name}] at.pdf`,
            content: pdfBuffer.toString('base64'),
        }]
    })

    return res.send({ order: order })
}

export {
    getOrders,
    upsertOrder,
    getOrderById,
    deleteOrder,

    sendEmailOrder
}