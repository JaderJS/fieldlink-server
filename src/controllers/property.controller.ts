import { applyFilters } from "@/core/filter"
import { db } from "@/plugins/prisma.plugins"
import { db } from "@prisma/client"
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"

const getProperties = async (req: FastifyRequest, res: FastifyReply) => {

    const propertiesQuery = await db.property.findMany({
        include: { station: { include: { analog: {}, digital: {}, equipments: {}, groups: {} } } },
        orderBy: { id: 'asc' }
    })
    return res.send({ properties: propertiesQuery })
}

const upsertProperty = async (req: FastifyRequest, res: FastifyReply) => {
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

    return res.status(501).send()

}

export {
    getProperties,
    upsertProperty
} 