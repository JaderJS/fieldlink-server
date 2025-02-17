import { CONSTANTS } from '@/constants'
import { Product } from '@/models/product-model'
import { Service } from '@/models/service-model'
import { User } from '@/models/user-model'
import { prisma } from '@/plugins/prisma.plugins'
import { findOrCreatePeriod } from '@/services/period.services'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const getProducts = async (req: FastifyRequest, res: FastifyReply) => {

    const query = z.object({ ids: z.array(z.coerce.number()) }).safeParse(req.query)

    const whereCondition = query.success ? { id: { in: query.data.ids } } : {}

    const productsQuery = await prisma.product.findMany({
        where: whereCondition,
        include:
            { category: { include: { products: {} } }, orders: {}, productsOnWork: {}, cart: {} }
    })

    const categoriesQuery = await prisma.productCategory.findMany({
        where: whereCondition,
        include: {
            products: {
                include: {
                    orders: {},
                    productsOnWork: {},
                    cart: {},
                    category: {}
                }
            }
        }
    })

    const products = productsQuery
        .map((p) => {
            const outputOrder = p.orders.reduce((acc, arg) => acc + arg.quantity, 0)
            const outputWork = p.productsOnWork.reduce((acc, arg) => acc + arg.quantity, 0)
            const inputCart = p.cart.reduce((acc, arg) => acc + arg.quantity, 0)
            const total = inputCart - (outputOrder + outputWork)
            return { ...p, stock: total }
        })

    const categories = categoriesQuery
        .map((category) => {
            const products = category.products.map((p) => {
                const outputOrder = p.orders.reduce((acc, arg) => acc + arg.quantity, 0)
                const outputWork = p.productsOnWork.reduce((acc, arg) => acc + arg.quantity, 0)
                const inputCart = p.cart.reduce((acc, arg) => acc + arg.quantity, 0)
                const total = inputCart - (outputOrder + outputWork)
                return { ...p, stock: total }
            })

            return { ...category, products }
        })
        .filter(c => c.products.length !== 0)

    return res.send({ products, categories })
}

const balanceProducts = async (req: FastifyRequest, res: FastifyReply) => {
    const productsQuery = await prisma.product.findMany({
        include:
            { category: { include: { products: {} } }, orders: {}, productsOnWork: {}, cart: {} }
    })

    const sellProducts = productsQuery
        .map((p) => {
            const outputOrder = p.orders.reduce((acc, arg) => acc + arg.quantity, 0)
            const outputWork = p.productsOnWork.reduce((acc, arg) => acc + arg.quantity, 0)
            const total = (outputOrder + outputWork) * -1
            return { ...p, stock: total }
        })

    const buyProducts = productsQuery
        .map((p) => {
            const inputCart = p.cart.reduce((acc, arg) => acc + arg.quantity, 0)
            const total = inputCart
            return { ...p, stock: total }
        })

    return res.send({ sells: sellProducts, buy: buyProducts })
}

const getProduct = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.union([z.coerce.number(), z.array(z.number())]) }).parse(req.body)
    // const products = await prisma.product.findUniqueOrThrow({ where: { id }, include: { category: { include: { products: {} } } } })
    return res.send()
}

const upsertProduct = async (req: FastifyRequest, res: FastifyReply) => {

    const {
        id,
        name,
        pictureUrl,
        description,
        price,
        sale,
        discountType,
        discountValue,
        stock,
        unity,
        categoryId: CategoryId
    } = z
        .object({
            id: z.coerce.number().default(0),
            name: z.string(),
            pictureUrl: z.string(),
            description: z.string().optional(),
            price: z.coerce.number(),
            discountType: z.enum(['NONE', 'PERCENT', 'AMOUNT']),
            discountValue: z.number(),
            stock: z.number().default(0),
            unity: z.enum(["UND", "m", "L", "g"]),
            categoryId: z.coerce.number()
        })
        .and(z.union([
            z.object({ sale: z.coerce.number(), priceFn: z.undefined() }),
            z.object({ sale: z.undefined(), priceFn: z.string() })
        ]))
        .parse(req.body)

    const salePriceCalc = !!sale ? sale : price * 1.8

    const product = await prisma.product.upsert({
        where: { id },
        create: {
            name,
            pictureUrl,
            description,
            price,
            discountType,
            discountValue,
            unity,
            stock,
            CategoryId,
            priceHistory: {
                create: {
                    costValue: price,
                    saleValue: salePriceCalc,
                    updatedCuid: req.user.cuid,
                }
            },
            createCuid: req.user.cuid,
            updatedCuid: req.user.cuid
        },
        update: {
            name,
            pictureUrl,
            description,
            price,
            discountType,
            discountValue,
            stock,
            unity,
            CategoryId,
            priceHistory: {
                create: {
                    costValue: price,
                    saleValue: salePriceCalc,
                    updatedCuid: req.user.cuid,
                }
            },
            updatedCuid: req.user.cuid
        }
    })

    return res.status(200).send(product)
}

const updateProduct = async (req: FastifyRequest, res: FastifyReply) => {

    console.log("DROPPING...")
    const { id } = z.object({ id: z.coerce.number().default(0) }).parse(req.params)
    const { isDelete } = z
        .object({
            isDelete: z.boolean().optional(),
        }).parse(req.body)

    if (isDelete) {
        const drop = await prisma.product.delete({ where: { id } })
        console.log("DROPPING SUCCESS", drop)
        return res.status(200).send()
    }


    return res.status(200).send()
}

const getCategoryInProducts = async (req: FastifyRequest, res: FastifyReply) => {
    const categories = await prisma.productCategory.findMany()

    return res.send({ categories })
}

const createCategory = async (req: FastifyRequest, res: FastifyReply) => {

    const { name, slug, tags } = z
        .object({ name: z.string() })
        .transform((args) => ({ ...args, slug: args.name, tags: [args.name] }))
        .parse(req.body)

    const category = await prisma.productCategory.create({
        data: {
            name,
            slug,
            tags,
        }
    })
    return res.send({ category })
}

const createOnePurchase = async (req: FastifyRequest, res: FastifyReply) => {

    const { products, supplierId, payment } = z.object({
        products: z.array(z.object({
            id: z.coerce.number(),
            name: z.string(),
            quantity: z.coerce.number(),
            price: z.coerce.number()
        })),
        supplierId: z.coerce.number(),
        payment: z.object({
            method: z.enum(['INTEGRAL', 'INSTALLMENT', 'OTHERS']),
            total: z.coerce.number().min(0),
            bankId: z.coerce.number(),
            installments: z.object({
                count: z.coerce.number().min(1).max(12),
            }).optional()
        })
    }).parse(req.body)

    const title = `Compra fornecedor`
    const companyId = 1
    const description = products.map(({ name }) => name).join(' - ')

    const periodAt = new Date()

    const period = await findOrCreatePeriod({ periodAt })

    products.map(async ({ id, price, quantity }) => {
        const { stock } = await prisma.product.findUniqueOrThrow({ where: { id } })

        await prisma.product.update({
            where: { id },
            data: {
                stock: stock + quantity
            }
        })
    })

    if (payment.method === 'INTEGRAL') {
        await prisma.cart.create({
            data: {
                products: {
                    createMany: { data: products.map(({ id, quantity, price }) => ({ productId: id, price, quantity })) }
                },
                transaction: {
                    create: {
                        title,
                        description,
                        type: 'OUTPUT',
                        value: payment.total,
                        bankId: payment.bankId,
                        companyId: 1,
                        createCuid: req.user.cuid,
                        updatedCuid: req.user.cuid,
                        periodId: period.id
                    },
                },
                status: 'INIT',
                supplierId,
                assignedCuid: req.user.cuid
            }
        })

        return res.send()
    }

    else if (payment.method === 'INSTALLMENT' && !!payment.installments?.count) {


        const installments = Array.from({ length: payment.installments.count }).map((_, index) => {
            return {
                title: `${title} ${index + 1}/${payment.installments?.count}`,
                description,
                type: 'OUTPUT' as const,
                value: payment.total / (payment.installments?.count ?? 1),
                bankId: payment.bankId,
                companyId,
                createCuid: req.user.cuid,
                updatedCuid: req.user.cuid,
                periodId: period.id
            }
        })

        await prisma.cart.create({
            data: {
                products: {
                    createMany: { data: products.map(({ id, quantity, price }) => ({ productId: id, price, quantity })) }
                },
                transaction: {
                    createMany: {
                        data: installments,
                    }
                },
                status: 'INIT',
                supplierId,
                assignedCuid: req.user.cuid
            }
        })

        return res.send()
    }


}

const getSuppliers = async (req: FastifyRequest, res: FastifyReply) => {
    const suppliers = await prisma.supplier.findMany()
    return res.send({ suppliers })
}

export {
    getProducts,
    getProduct,
    updateProduct,
    upsertProduct,
    createCategory,
    createOnePurchase,
    getSuppliers,
    getCategoryInProducts,
    balanceProducts
}