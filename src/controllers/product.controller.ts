import { prisma } from '@/plugins/prisma.plugins'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const getProducts = async (req: FastifyRequest, res: FastifyReply) => {

    const query = z.object({ ids: z.array(z.coerce.number()) }).safeParse(req.query)

    const whereCondition = query.success ? { id: { in: query.data.ids } } : {}

    const productsQuery = await prisma.product.findMany({
        where: whereCondition,
        include: {
            category: {
                include: { products: {} }
            },
            productsOnOrder: {},
            productsOnCart: {},
            priceHistory: { orderBy: { createdAt: 'desc' }, take: 3 },
        },
        orderBy: { id: 'asc' }
    })

    const categoriesQuery = await prisma.productCategory.findMany({
        where: whereCondition,
        include: {
            products: {
                include: {
                    productsOnOrder: {},
                    productsOnCart: {},
                    category: {},
                    priceHistory: { orderBy: { createdAt: 'desc' }, take: 3 },
                }
            }
        }
    })

    const products = productsQuery
        .map((p) => {
            const outputOrder = p.productsOnOrder.reduce((acc, arg) => acc + arg.quantity, 0)
            const inputCart = p.productsOnCart.reduce((acc, arg) => acc + arg.quantity, 0)
            const total = inputCart + outputOrder
            return {
                ...p,
                costValue: p.priceHistory?.[0]?.costValue ?? p.price,
                saleValue: p.priceHistory?.[0]?.saleValue ?? 0,
                stock: total,
                price: p.priceHistory?.[0]?.costValue ?? p.price,
                sale: p.priceHistory?.[0]?.saleValue ?? 0,
            }
        })

    const categories = categoriesQuery
        .map((category) => {
            const products = category.products.map((p) => {
                const outputOrder = p.productsOnOrder.reduce((acc, arg) => acc + arg.quantity, 0)
                const inputCart = p.productsOnCart.reduce((acc, arg) => acc + arg.quantity, 0)
                const total = inputCart + outputOrder
                return {
                    ...p,
                    stock: total,
                    price: p.priceHistory?.[0]?.costValue ?? p.price,
                    sale: p.priceHistory?.[0]?.saleValue ?? 0,
                    costValue: p.priceHistory?.[0]?.costValue ?? p.price,
                    saleValue: p.priceHistory?.[0]?.saleValue ?? 0,
                }
            })
            return { ...category, products }
        })
        .filter(c => c.products.length !== 0)

    return res.send({ products, categories })
}

const balanceProducts = async (req: FastifyRequest, res: FastifyReply) => {
    const productsQuery = await prisma.product.findMany({
        include:
            { category: { include: { products: {} } }, productsOnOrder: {}, productsOnCart: {} }
    })

    const sellProducts = productsQuery
        .map((p) => {
            const outputOrder = p.productsOnOrder.reduce((acc, arg) => acc + arg.quantity, 0)
            const total = (outputOrder) * -1
            return { ...p, stock: total }
        })

    const buyProducts = productsQuery
        .map((p) => {
            const inputCart = p.productsOnCart.reduce((acc, arg) => acc + arg.quantity, 0)
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
            sale: z.coerce.number(),
            discountType: z.enum(['NONE', 'PERCENT', 'AMOUNT']),
            discountValue: z.number(),
            stock: z.number().default(0),
            unity: z.enum(["UND", "m", "L", "g"]),
            categoryId: z.coerce.number()
        })
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
                    createdCuid: req.user.cuid,
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
                    createdCuid: req.user.cuid,
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

const getPurchase = async (req: FastifyRequest, res: FastifyReply) => {

    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)

    const cartQuery = await prisma.cart.findUniqueOrThrow({
        where: { id },
        include: {
            otherValues: {}, assignedBy: {}, supplier: {}, productsOnCart: { include: { product: {} } }, transaction: { include: { period: {} } }
        },
    })
    return res.send({ cart: cartQuery })
}

const getPurchases = async (req: FastifyRequest, res: FastifyReply) => {
    const cartsQuery = await prisma.cart.findMany({
        include: {
            otherValues: {}, assignedBy: {}, supplier: {}, productsOnCart: { include: { product: {} } }, transaction: {}
        },
        orderBy: { createdAt: 'desc' }
    })
    return res.send({ carts: cartsQuery })
}

const upsertPurchase = async (req: FastifyRequest, res: FastifyReply) => {

    const { id, cart, supplierId, payment, otherValues } = z.object({
        id: z.coerce.number().default(0),
        cart: z.object({
            id: z.coerce.number().default(0),
            status: z.enum(['PROCESS', 'INIT', 'FINISHED']),
            productsOnCart: z.array(z.object({
                id: z.coerce.number(),
                quantity: z.coerce.number(),
                price: z.coerce.number(),
            })).min(1),
        }),
        otherValues: z.array(z.object({
            id: z.coerce.number().default(0),
            name: z.string(),
            price: z.coerce.number()
        })).optional(),
        supplierId: z.coerce.number(),
        payment: z.object({
            method: z.enum(['INTEGRAL', 'INSTALLMENTS', 'OTHER']).default('INTEGRAL'),
            total: z.coerce.number(),
            transactions: z.array(z.object({
                id: z.coerce.number().default(0),
                value: z.coerce.number(),
                bankId: z.coerce.number(),
                fromAt: z.coerce.date(),
                periodId: z.coerce.number()
            })).nonempty(),
        })
    }).parse(req.body)

    const title = `Compra fornecedor`
    const companyId = 1

    const cartMutation = await prisma.cart.upsert({
        where: { id },
        create: {
            status: cart.status,
            assignedCuid: req.user.cuid,
            supplierId,
            total: payment.total
        },
        update: {
            supplierId,
            total: payment.total
        }
    })

    await prisma.productsOnCart.deleteMany({ where: { cartId: cart.id, productId: { notIn: cart.productsOnCart.map(({ id }) => id) } } })
    cart?.productsOnCart.map(async ({ price, quantity, ...product }) => {
        await prisma.productsOnCart.upsert({
            where: { cartId_productId: { cartId: cart.id, productId: product.id } },
            create: {
                price,
                quantity: Math.abs(quantity),
                cartId: cartMutation.id,
                productId: product.id
            },
            update: {
                price,
                quantity: Math.abs(quantity),
            }
        })
    })

    await prisma.otherValues.deleteMany({ where: { cart: { every: { id: id } }, id: { notIn: otherValues?.map(({ id }) => id) } } })
    otherValues?.map(async ({ id, name, price }) => {
        await prisma.otherValues.upsert({
            where: { id },
            create: {
                name,
                price,
                cart: { connect: { id: cartMutation.id } }
            }, update: {
                name,
                price,
            }
        })
    })

    let parentId: number | undefined

    await prisma.transactions.deleteMany({ where: { cartId: cart.id, id: { notIn: payment.transactions.map(({ id }) => id) } } })
    for (const [index, { id, periodId, value, fromAt, bankId }] of payment.transactions.entries()) {
        const title = `${payment.transactions.length}/${index + 1} - [compra]`

        const transaction = await prisma.transactions.upsert({
            where: { id },
            create: {
                periodId,
                title,
                value: Math.abs(value) * -1,
                fromAt,
                type: "OUTPUT",
                companyId,
                bankId,
                createCuid: req.user.cuid,
                updatedCuid: req.user.cuid,
                parentTransactionId: parentId,
                cartId: cartMutation.id,
            },
            update: {
                periodId,
                title,
                value: Math.abs(value) * -1,
                fromAt,
                companyId,
                bankId,
                updatedCuid: req.user.cuid,
                parentTransactionId: parentId,
                cartId: cartMutation.id
            }
        })

        if (index === 0) {
            parentId = transaction.id
        }
    }

    return res.status(201).send()
}

const deletePurchase = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)

    await prisma.cart.delete({ where: { id } })

    return res.status(204).send()

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

    getPurchases,
    getPurchase,
    upsertPurchase,
    deletePurchase,

    getSuppliers,
    getCategoryInProducts,
    balanceProducts
}