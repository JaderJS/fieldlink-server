import { applyFilters } from "@/core/filter"
import { makeFilters, whereConstructor } from "@/core/prisma.where"
import { db } from "@/plugins/prisma.plugins"
import { Prisma } from "@/../prisma/generated/client"
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
    }).and(z.union([
        z.object({
            mode: z.literal("digital"), digital: z.object({
                id: z.coerce.number().default(-1),
                stationId: z.coerce.number(),
                slot: z.coerce.number(),
                colorCode: z.coerce.number(),
            }),
        }),
        z.object({
            mode: z.literal("analog"), analog: z.object({
                id: z.coerce.number().default(-1),
                stationId: z.coerce.number(),
                silent: z.enum(["CSQ", "TPL", "DPL_N", "DPL_I"]),
                encoder: z.coerce.number(),
                decoder: z.coerce.number()
            }),
        }),
    ])).parse(req.body)

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
    if (mode === "analog" && "analog" in station) {
        await db.stationAnalog.upsert({
            where: {
                id: station.analog.id,
                stationId: stationMutation.id
            },
            create: {
                silent: station.analog.silent,
                encoder: station.analog.encoder,
                decoder: station.analog.decoder,
                stationId: stationMutation.id
            },
            update: {
                silent: station.analog.silent,
                encoder: station.analog.encoder,
                decoder: station.analog.decoder,
            }
        })
    }
    else if (mode === "digital" && "digital" in station) {
        await db.stationDigital.upsert({
            where: {
                id: station.digital.id,
                stationId: stationMutation.id
            },
            create: {
                colorCode: station.digital.colorCode,
                slot: station.digital.slot,
                stationId: stationMutation.id
            },
            update: {
                colorCode: station.digital.colorCode,
                slot: station.digital.slot,
            }
        })
    }

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