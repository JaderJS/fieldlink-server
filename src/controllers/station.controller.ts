import { prisma } from "@/plugins/prisma.plugins"
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"

const getStations = async (req: FastifyRequest, res: FastifyReply) => {
    const stationsQuery = await prisma.station.findMany({
        include: { analog: {}, digital: {}, equipments: {}, groups: {}, property: {} },
        orderBy: { id: 'asc' }
    })
    return res.send({ stations: stationsQuery })
}

const getStation = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)

    const stationQuery = await prisma.station.findUniqueOrThrow({
        where: { id },
        include: { analog: {}, digital: {}, equipments: {}, groups: {}, property: {} },
    })
    return res.send({ station: stationQuery })
}

export {
    getStations,
    getStation
} 