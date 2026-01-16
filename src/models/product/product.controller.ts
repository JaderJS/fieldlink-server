import { db } from '@/plugins/prisma.plugins'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const getProducts = async (req: FastifyRequest, res: FastifyReply) => {
    const productsQuery = await db.product.findMany({
        include: {
            categories: true,
            cartsOnProduct: true,
            salesOnProduct: {
                include: {
                    sale: {
                        include: {
                            order: {
                                include: {
                                    status: true
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: {
            stock: "desc",
        }
    })


    const products = productsQuery.map((product) => {

        const count = product.salesOnProduct.reduce((acc, s) => acc + s.quantity, 0)

        const totalIn = product.cartsOnProduct.reduce((acc, c) => acc + (c.quantity ?? 0), 0)

        const totalOut = product.salesOnProduct.reduce((acc, sales) => {
            if (sales.sale.order.status.id !== 2) {
                acc += (sales.quantity ?? 0)
            }
            return acc
        }, 0)

        const totalRevenue = product.salesOnProduct.reduce((acc, sales) => {
            if (sales.sale.order.status.id !== 2) {
                acc += (sales.quantity ?? 0) * (sales.price)
            }
            return acc
        }, 0)
        const prices = product.salesOnProduct.map(s => s.price).filter(s => typeof s === 'number')

        const maxPrice = prices.length ? Math.max(...prices) : 0
        const minPrice = prices.length ? Math.min(...prices) : 0
        const avgPrice = (totalOut > 0) ? (totalRevenue / totalOut) : 0

        const variation = (minPrice > 0) ? ((maxPrice - minPrice) / minPrice) : 0

        return ({
            ...product,
            stock: (
                product.cartsOnProduct.reduce((acc, cart) => acc += cart.quantity, 0) +
                - totalOut
            ),
            group: [...new Set(product.categories.map((c) => c.name))].join(", "),
            summary: {
                maxPrice: maxPrice,
                minPrice: minPrice,
                avgPrice: avgPrice,
                variation: variation * 100,
                total: {
                    out: totalOut,
                    in: totalIn
                },
                _count: {
                    sales: count
                },
            }
        })
    })


    return res.send({ products: products })
}

const getProductById = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)
    const productsQuery = await db.product.findUniqueOrThrow({
        where: { id },
        include: {
            categories: true
        }
    })
    return res.send({ product: productsQuery })
}

const upsertProduct = async (req: FastifyRequest, res: FastifyReply) => {
    const { id, name, pictureUrl, price, cost, categoriesIds, description } = z.object({
        id: z.coerce.number().default(-1),
        name: z.string(),
        pictureUrl: z.url(),
        price: z.coerce.number(),
        cost: z.coerce.number(),
        description: z.string().optional(),
        categoriesIds: z.array(z.coerce.number()).default([])
    }).parse(req.body)


    const mutation = await db.$transaction(async (tx) => {
        const user = req.user
        const product = await tx.product.findUnique({
            where: { id },
            include: { cartsOnProduct: true, salesOnProduct: true, categories: true }
        })

        let stock: number = 0
        if (!!product) {
            stock = (
                product.cartsOnProduct.reduce((acc, cart) => acc += cart.quantity, 0) +
                - product.salesOnProduct.reduce((acc, sale) => acc += sale.quantity, 0)
            )
        }

        const currentCategoryIds = product?.categories.map(c => c.id) || []
        const categoriesToConnect = categoriesIds.filter(id => !currentCategoryIds.includes(id))
        const categoriesToDisconnect = currentCategoryIds.filter(id => !categoriesIds.includes(id))

        const productMutation = await db.product.upsert({
            where: { id },
            create: {
                name,
                price,
                cost,
                pictureUrl,
                stock: stock,
                updatedByCuid: user.cuid,
                description,
                categories: {
                    connect: categoriesToConnect.map(id => ({ id }))
                }
            },
            update: {
                name,
                price,
                cost,
                pictureUrl,
                stock: stock,
                description,
                updatedByCuid: user.cuid,
                histories: {
                    create: !!product ? {
                        cost: product?.cost,
                        price: product?.price,
                        stock: product?.stock,
                    } : undefined
                },
                categories: {
                    disconnect: categoriesToDisconnect.map(id => ({ id })),
                    connect: categoriesToConnect.map(id => ({ id }))
                }
            }
        })
        return productMutation
    })

    return res.status(200).send({ product: mutation })
}

const deleteProduct = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)
    const product = await db.product.delete({ where: { id } })
    return res.send({ product: product })
}

const getAnalyticsProducts = async (req: FastifyRequest, res: FastifyReply) => {

    const from = new Date()
    const to = new Date()

    const topProductsQuery = await db.productsOnSales.groupBy({
        by: ['productId'],
        // where: { sale: { createdAt: { gte: from, lte: to } } },
        _sum: { quantity: true },
        _count: { _all: true },
        orderBy: { _sum: { quantity: 'desc' } }
    })

    return res.send({ topProducts: topProductsQuery })
}

export {
    getProducts,
    getProductById,
    upsertProduct,
    deleteProduct,
    getAnalyticsProducts
}