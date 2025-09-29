import { db } from '@/plugins/prisma.plugins'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const getProducts = async (req: FastifyRequest, res: FastifyReply) => {
    const productsQuery = await db.product.findMany({
        include: {
            categories: true,
            cartsOnProduct: true,
            salesOnProduct: true
        },
        orderBy: {
            id: "asc"
        }
    })

    const products = productsQuery.map((product) => ({
        ...product,
        stock: (
            product.cartsOnProduct.reduce((acc, cart) => acc += cart.quantity, 0) +
            - product.salesOnProduct.reduce((acc, sale) => acc += sale.quantity, 0)
        ),
        group: [...new Set(product.categories.map((c) => c.name))].join(", ")
    }))


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
        id: z.coerce.number().default(0),
        name: z.string(),
        pictureUrl: z.string().url(),
        price: z.coerce.number(),
        cost: z.coerce.number(),
        description: z.string().optional(),
        categoriesIds: z.array(z.coerce.number()).default([])
    }).parse(req.body)

    const mutation = await db.$transaction(async (tx) => {
        const user = req.user
        const oldProduct = await db.product.findUnique({ where: { id }, select: { cost: true, price: true, stock: true, categories: { select: { id: true } } } })

        const currentCategoryIds = oldProduct?.categories.map(c => c.id) || []
        const categoriesToConnect = categoriesIds.filter(id => !currentCategoryIds.includes(id))
        const categoriesToDisconnect = currentCategoryIds.filter(id => !categoriesIds.includes(id))

        const product = await db.product.upsert({
            where: { id },
            create: {
                name,
                price,
                cost,
                pictureUrl,
                stock: 0,
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
                stock: 0,
                description,
                updatedByCuid: user.cuid,
                histories: {
                    create: {
                        cost: oldProduct?.cost ?? 0,
                        price: oldProduct?.price ?? 0,
                        stock: oldProduct?.stock ?? 0,
                    }
                },
                categories: {
                    disconnect: categoriesToDisconnect.map(id => ({ id })),
                    connect: categoriesToConnect.map(id => ({ id }))
                }
            }
        })
        return product
    })

    return res.status(200).send({ product: mutation })
}

const deleteProduct = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)
    const product = await db.product.delete({ where: { id } })
    return res.send({ product: product })
}
export {
    getProducts,
    getProductById,
    upsertProduct,
    deleteProduct
}