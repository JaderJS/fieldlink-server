import { applyFilters } from "@/core/filter"
import { makeFilters, whereConstructor } from "@/core/prisma.where"
import { db } from "@/plugins/prisma.plugins"
import { Prisma } from "@prisma/client"
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"

const getStations = async (req: FastifyRequest, res: FastifyReply) => {

    const filtersSchema = z.object({
        excludeStationId: z.coerce.number().optional(),
        frequency: z.object({
            rx: z.coerce.number().optional(),
            tx: z.coerce.number().optional(),
            renge: z.coerce.number().default(25E3),
        }).optional(),
    }).optional()

    const query = filtersSchema.parse((req.query as any)?.filters!)
    const margin = query?.frequency?.renge ?? 25E3

    const filtersMap = makeFilters(filtersSchema)<Prisma.StationWhereInput>()({
        excludeStationId: ({ filter }) => ({ id: { not: filter } }), // filter: number
        frequency: {
            op: "OR",
            fields: {
                rx: ({ filter }) => ({ rx: { lte: filter + margin, gt: filter - margin } }), // filter: number
                tx: ({ filter }) => ({ tx: { lte: filter + margin, gt: filter - margin } }), // filter: number
            },
        },
    });


    const where = whereConstructor({
        schema: filtersSchema,
        filters: filtersMap,
        query: query,
    }) as Prisma.StationWhereInput | undefined

    // console.log(query, JSON.stringify(where, null, 2))

    const stationsQuery = await db.station.findMany({
        where: where,
        include: {
            analog: true,
            digital: true,
            equipments: { include: { product: true } },
            groups: true,
            property: true
        },
        orderBy: { id: 'asc' }
    })

    return res.send({ stations: stationsQuery })
}

const getStation = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)

    const stationQuery = await db.station.findUniqueOrThrow({
        where: { id },
        include: { analog: true, digital: true, equipments: { include: { product: true } }, groups: {}, property: {} },
    })
    return res.send({ station: stationQuery })
}

const upsertStation = async (req: FastifyRequest, res: FastifyReply) => {
    const { id, content, isActive, latitude, longitude, propertyId, rx, tx, mode, ...station } = z.object({
        id: z.coerce.number().default(-1),
        propertyId: z.coerce.number(),
        content: z.record(z.string(), z.any()).optional(),
        rx: z.coerce.number(),
        tx: z.coerce.number(),
        latitude: z.coerce.number(),
        longitude: z.coerce.number(),
        isActive: z.boolean(),
        mode: z.enum(['digital', 'analog']),
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
    }).transform(({ analog, digital, mode, ...data }, ctx) => {
        if (mode === 'digital') {
            return { ...data, mode, digital }
        }
        return {
            ...data,
            mode,
            analog: analog?.silent === 'CSQ' ? { silent: analog?.silent } : analog
        }
    }).parse(req.body)

    const stationMutation = await db.station.upsert({
        where: { id },
        create: {
            property: { connect: { id: propertyId } },
            content: "",
            isActive,
            latitude,
            longitude,
            rx,
            tx,
        },
        update: {
            property: { connect: { id: propertyId } },
            content: "",
            isActive,
            latitude,
            longitude,
            rx,
            tx,
        }
    })
    return res.send({ station: stationMutation })
}

const deleteStation = async (req: FastifyRequest, res: FastifyReply) => {
    const { stationId } = z.object({ stationId: z.coerce.number() }).parse(req.params)
    await db.station.delete({
        where: { id: stationId }
    })

    return res.status(204).send()
}

export {
    getStations,
    getStation,
    upsertStation,
    deleteStation
} 