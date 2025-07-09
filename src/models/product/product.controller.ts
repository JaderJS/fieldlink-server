import { db } from '@/plugins/prisma.plugins'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const getProducts = async (req: FastifyRequest, res: FastifyReply) => {
    const productsQuery = await db.product_.findMany()
    return res.send({ products: productsQuery })
}
const upsertProduct = async (req: FastifyRequest, res: FastifyReply) => {
    const { id, name, pictureUrl, price, cost } = z.object({
        id: z.coerce.number().default(0),
        name: z.string(),
        pictureUrl: z.string().url(),
        price: z.coerce.number(),
        cost: z.coerce.number()
    }).parse(req.body)

    const product = await db.product_.upsert({
        where: { id },
        create: {
            name,
            price,
            cost,
            pictureUrl,
            stock: 0,
        },
        update: {
            name,
            price,
            cost,
            pictureUrl,
            stock: 0
        }
    })
    return res.status(200).send({ product: product })
}
const deleteProduct = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)
    const product = await db.product_.delete({ where: { id } })
    return res.send({ product: product })
}
export {
    getProducts,
    upsertProduct,
    deleteProduct
}