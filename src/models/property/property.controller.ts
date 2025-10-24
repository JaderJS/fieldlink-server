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

    getById: async (req: FastifyRequest, res: FastifyReply) => {
        const { id } = z.object({ id: z.coerce.number() }).parse(req.params)
        const propertyQuery = await db.property.findUnique({ where: { id }, include: { client: true, stations: true } })
        return res.send({ property: propertyQuery })
    },

    upsert: async (req: FastifyRequest, res: FastifyReply) => {
        const { id, title, city, clientId, stationsIds } = z.object({
            id: z.coerce.number().default(-1),
            title: z.string(),
            city: z.string(),
            clientId: z.coerce.number(),
            stationsIds: z.array(z.number()).default([])
        }).parse(req.body)

        const mutation = await db.$transaction(async (tx) => {
            const propertyMutation = await tx.property.upsert({
                where: { id },
                create: {
                    title: title,
                    city: city,
                    clientId: clientId,
                    stations: {
                        connect: stationsIds.map((sid) => ({ id: sid }))
                    }
                },
                update: {
                    title: title,
                    city: city,
                    clientId: clientId,
                    stations: {
                        set: stationsIds.map((sid) => ({ id: sid }))
                    }
                }
            })

            return propertyMutation
        })



        return res.send({ property: mutation })
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