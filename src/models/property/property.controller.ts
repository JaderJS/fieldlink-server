import { db } from "@/plugins/prisma.plugins"
import { FastifyReply, FastifyRequest } from "fastify"
import z from "zod"

export const propertyController = {
    getAll: async (req: FastifyRequest, res: FastifyReply) => {

        const filters = z.object({
            clientId: z.coerce.number().optional()
        }).optional().parse(req.query)

        const propertiesQuery = await db.property.findMany({
            where: filters ? {
                clientId: filters.clientId
            } : undefined,
            include: { stations: { include: { analog: true, digital: true } }, client: true }
        })
        return res.send({ properties: propertiesQuery })
    },
    upsert: async (req: FastifyRequest, res: FastifyReply) => {
        const { id, title, city, clientId } = z.object({
            id: z.coerce.number().default(-1),
            title: z.string(),
            city: z.string(),
            clientId: z.coerce.number()
        }).parse(req.body)

        const propertyMutation = await db.property.upsert({
            where: { id },
            create: {
                title: title,
                city: city,
                clientId: clientId
            },
            update: {
                title: title,
                city: city,
                clientId: clientId
            }
        })

        return res.send({ property: propertyMutation })
    },
    delete: async (req: FastifyRequest, res: FastifyReply) => {
        const { id } = z.object({
            id: z.coerce.number()
        }).parse(req.params)

        const propertyMutation = await db.property.delete({
            where: { id },
        })

        return res.send({ property: propertyMutation })
    }
}