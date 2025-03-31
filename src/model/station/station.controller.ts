import { applyFilters } from "@/core/filter"
import { whereConstructor } from "@/core/prisma.where"
import { db } from "@/plugins/prisma.plugins"
import { Prisma } from "@prisma/client"
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"

const getStations = async (req: FastifyRequest, res: FastifyReply) => {

    const { margin = 25E3 / 2, ...query } = z.object({
        rx: z.coerce.number().optional(),
        tx: z.coerce.number().optional(),
        margin: z.coerce.number().default(25E3 / 2),
        isActive: z.string().optional().transform((val) => val === "true" ? true : val === "false" ? false : undefined),
    }).parse(req.query)

    const where = whereConstructor<Prisma.StationWhereInput>({
        query: query as { [key: string]: unknown },
        filters: {
            rx: ({ filter }) => ({
                where: {
                    AND: [
                        { rx: { lte: Number(filter) + margin } },
                        { rx: { gt: Number(filter) - margin } },
                    ]
                }
            }),
            tx: ({ filter }) => ({
                where: {
                    AND: [
                        { tx: { lte: Number(filter) + margin } },
                        { tx: { gt: Number(filter) - margin } },
                    ]
                }
            }),
            isActive: ({ filter }) => ({
                where: {
                    isActive: Boolean(filter)
                }
            })
        },
    })

    console.log(where)

    const stationsQuery = await db.station.findMany({
        where: where,
        include: { analog: {}, digital: {}, equipments: {}, groups: {}, property: {} },
        orderBy: { id: 'asc' }
    })

    return res.send({ stations: stationsQuery })
}

const getStation = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)

    const stationQuery = await db.station.findUniqueOrThrow({
        where: { id },
        include: { analog: {}, digital: {}, equipments: {}, groups: {}, property: {} },
    })
    return res.send({ station: stationQuery })
}

const upsertStation = async (req: FastifyRequest, res: FastifyReply) => {
    const upsertStationSchema = z.object({
        id: z.coerce.number().optional(),
        propertyId: z.coerce.number(),
        content: z.string(),
        rx: z.coerce.number(),
        tx: z.coerce.number(),
        latitude: z.coerce.number(),
        longitude: z.coerce.number(),
        isActive: z.boolean(),
        type: z.enum(['digital', 'analog']),
        digital: z.object({
            id: z.coerce.number().optional(),
            slot: z.coerce.number().min(0).max(2),
            colorCode: z.coerce.number().min(0).max(15)
        }).optional(),
        analog: z.object({
            id: z.coerce.number().optional(),
            silent: z.enum(["CSQ", "TPL", "DPL"]),
            encoder: z.coerce.number().optional(),
            decoder: z.coerce.number().optional(),
        }).superRefine((data, ctx) => {
            if (data.silent !== 'CSQ') {
                if (data.encoder === undefined) {
                    ctx.addIssue({
                        code: 'custom',
                        message: "Encoder é obrigatório quando Silent não é CSQ",
                        path: ["encoder"],
                    })
                }
                if (data.decoder === undefined) {
                    ctx.addIssue({
                        code: 'custom',
                        message: "Decoder é obrigatório quando Silent não é CSQ",
                        path: ["decoder"],
                    })
                }
            }
        }).optional()
    }).transform(({ analog, digital, type, ...data }, ctx) => {
        if (type === 'digital') {
            return { ...data, type, digital }
        }
        return {
            ...data,
            type,
            analog: analog?.silent === 'CSQ' ? { silent: analog?.silent } : analog
        }
    })

}

export {
    getStations,
    getStation
} 