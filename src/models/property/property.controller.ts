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
    }
}