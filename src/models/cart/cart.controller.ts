import { db } from '@/plugins/prisma.plugins'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const getCarts = async (req: FastifyRequest, res: FastifyReply) => {
    const cartsQuery = await db.cart.findMany({
        include: {
            supplier: true,
            transaction: { include: { installments: true } },
            productsOnCart: {
                include: {
                    product: true
                }
            }
        },
        orderBy: [{ createdAt: 'desc' }]
    })

    const carts = cartsQuery.map((cart) => ({
        ...cart,
        total: cart.total / 100,
        transaction: {
            ...cart.transaction,
            total: cart.transaction.total / 100,
            installments: cart.transaction.installments.map(i => ({ ...i, value: i.value / 100 }))
        }
    }))
    return res.send({ carts: carts })
}

const getCartById = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)
    const cartQuery = await db.cart.findUniqueOrThrow({
        where: { id },
        include: {
            supplier: true,
            productsOnCart: {
                include: {
                    product: { include: { categories: true } }
                }
            },
            transaction: { include: { installments: true } }
        }
    })

    const cart = {
        ...cartQuery,
        total: cartQuery.total / 100,
        transaction: {
            ...cartQuery.transaction,
            total: cartQuery.transaction.total / 100,
            installments: cartQuery.transaction.installments.map(i => ({ ...i, value: i.value / 100 }))
        }
    }
    return res.send({ cart: cart })
}

const upsertCart = async (req: FastifyRequest, res: FastifyReply) => {

    const user = req.user

    const { id, total, title, supplierId, productsOnCart, transaction, otherValues } = z.object({
        id: z.coerce.number().default(-1),
        title: z.string(),
        total: z.coerce.number().transform(arg => arg * 100),
        supplierId: z.coerce.number(),
        transaction: z.object({
            id: z.coerce.number().default(-1),
            title: z.string().min(3),
            type: z.enum(['INPUT', 'OUTPUT']),
            isDelete: z.boolean().default(false),
            hasNfe: z.boolean().default(false),
            total: z.coerce.number().transform(arg => arg * 100),
            companyId: z.coerce.number(),
            bankId: z.coerce.number(),
            hasNotify: z.coerce.boolean(),
            installments: z.array(z.object({
                id: z.coerce.number().default(-1),
                value: z.coerce.number().transform(arg => arg * 100),
                status: z.enum(["PENDING", "PAID", "PARTIAL", "CANCELLED", "REFUNDED"]),
                installmentsNumber: z.coerce.number(),
                paymentMethod: z.enum(["CARD", "PIX", "BOLETO", "TED", "CASH", "OTHER", "NOT_DECLARED"]),
                billed: z.coerce.boolean(),
                periodId: z.coerce.number(),
                transactionId: z.coerce.number(),
                dueAt: z.coerce.date(),
                paidAt: z.coerce.date().optional(),
                installmentsTotal: z.coerce.number().optional(),
                paymentReference: z.string().optional(),
            })).min(1),
            content: z.record(z.string(), z.any())
        }),
        productsOnCart: z.array(z.object({
            cartId: z.coerce.number().default(0),
            productId: z.coerce.number().default(0),
            quantity: z.coerce.number(),
            price: z.coerce.number()
        })).default([]),
        otherValues: z.array(z.object({
            id: z.coerce.number().default(-1),
            name: z.string(),
            price: z.coerce.number(),
        })).default([])
    }).parse(req.body)

    const mutation = await db.$transaction(async (tx) => {

        const transitionMutation = await tx.transactions.upsert({
            where: { id: transaction.id },
            create: {
                total: total,
                title: transaction.title,
                type: transaction.type,
                updatedCuid: user.cuid,
                createCuid: user.cuid,
                bankId: (await tx.bank.findOrFallback(transaction.bankId)).id,
                companyId: (await tx.company.findOrFallback(transaction.companyId))?.id!,
            },
            update: {
                total: total,
                title: transaction.title,
                type: transaction.type,
                updatedCuid: user.cuid,
                bankId: (await tx.bank.findOrFallback(transaction.bankId)).id,
            },
            include: {
                installments: true
            }
        })

        const cart = await tx.cart.upsert({
            where: { id },
            create: {
                title,
                total,
                supplierId: (await tx.supplier.findOrFallback(supplierId)).id,
                transactionId: transitionMutation.id,
                otherValues: otherValues
            },
            update: {
                title,
                total,
                supplierId: (await tx.supplier.findOrFallback(supplierId)).id,
                otherValues: otherValues
            }
        })

        await tx.installment.deleteMany({ where: { transactionId: transitionMutation.id, id: { notIn: transaction.installments.map(i => i.id) } } })
        for (const installment of transaction.installments) {
            await tx.installment.upsert({
                where: { id: installment.id },
                create: {
                    dueAt: installment.dueAt,
                    installmentsNumber: installment.installmentsNumber,
                    value: installment.value,
                    createdCuid: user.cuid,
                    updatedCuid: user.cuid,
                    periodId: (await tx.period.findOrFallbackCurrentMonth(installment.periodId)).id,
                    transactionId: transitionMutation.id,
                },
                update: {
                    dueAt: installment.dueAt,
                    installmentsNumber: installment.installmentsNumber,
                    value: installment.value,
                    updatedCuid: user.cuid,
                    periodId: installment.periodId,
                    billed: installment.billed
                }
            })
        }
        await tx.productsOnCarts.deleteMany({ where: { cartId: cart.id, productId: { notIn: productsOnCart.map(({ productId }) => productId) } } })
        for (const productOnCart of productsOnCart) {
            await tx.productsOnCarts.upsert({
                where: { cartId_productId: { cartId: cart.id, productId: productOnCart.productId } },
                create: {
                    price: productOnCart.price,
                    quantity: productOnCart.quantity,
                    cartId: productOnCart.cartId,
                    productId: productOnCart.productId
                },
                update: {
                    price: productOnCart.price,
                    quantity: productOnCart.quantity,
                }
            })
        }

        return cart
    })

    return res.status(200).send({ cart: mutation })
}

const deleteCart = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)
    const cart = await db.cart.delete({ where: { id } })
    return res.send({ cart: cart })
}

export {
    getCarts,
    getCartById,
    upsertCart,
    deleteCart
}