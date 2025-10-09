import { db } from "@/plugins/prisma.plugins"
import { FastifyReply, FastifyRequest } from "fastify"
import z from "zod"

export const getOrderStatus = async (req: FastifyRequest, res: FastifyReply) => {
    const orderStatusQuery = await db.orderStatus.findMany()
    return res.send({ status: orderStatusQuery })
}

export const upsertOrderStatus = async (req: FastifyRequest, res: FastifyReply) => {
    const { id, name, color } = z.object({
        id: z.number().default(-1),
        name: z.string(),
        color: z.string().default("#000000")
    }).parse(req.body)

    const orderStatusMutation = await db.orderStatus.upsert({
        where: { id: id },
        create: {
            name,
            color
        },
        update: {
            name,
            color
        }
    })
    return res.status(200).send({ status: orderStatusMutation })
}