import { prisma } from "@/plugins/prisma.plugins"
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"

const getProperties = async (req: FastifyRequest, res: FastifyReply) => {
    const propertiesQuery = await prisma.property.findMany({
        include: { station: { include: { analog: {}, digital: {}, equipments: {}, groups: {} } } },
        orderBy: { id: 'asc' }
    })
    return res.send({ properties: propertiesQuery })
}

export {
    getProperties,
} 