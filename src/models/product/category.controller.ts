import { db } from '@/plugins/prisma.plugins'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const getCategories = async (req: FastifyRequest, res: FastifyReply) => {
    const categoriesQuery = await db.categoryProduct.findMany()
    return res.send({ categories: categoriesQuery })
}

const upsertCategory = async (req: FastifyRequest, res: FastifyReply) => {

    const { id, connectToProductId } = z.object({
        id: z.coerce.number().default(0),
        connectToProductId: z.coerce.number()
    }).parse(req.body)

    await db.categoryProduct.upsert({
        where: { id: id },
        create: {
            name: "ad",
            products: {
                connect: { id: connectToProductId }
            }
        },
        update: {
            products: {
                connect: { id: connectToProductId }
            }
        }
    })

    // return res.send({ categories: categoriesQuery })
}


export {
    getCategories,
}