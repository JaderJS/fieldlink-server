import { db } from "@/plugins/prisma.plugins"
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"

const getChannelsSchema = async (req: FastifyRequest, res: FastifyReply) => {
    const channelsSchema = await db.channelSchema.findMany({ include: { equipments: {} } })
    return res.send({ channelsSchema })
}

const upsertChannelSchema = async (req: FastifyRequest, res: FastifyReply) => {
    const { id, title, content, equipmentsIds } = z.object({
        id: z.coerce.number().default(0),
        title: z.string(),
        content: z.string(),
        equipmentsIds: z.array(z.coerce.number())
    }).parse(req.body)

    await db.channelSchema.upsert({
        where: { id },
        create: {
            title,
            content,
            equipments: { connect: equipmentsIds.map((id) => ({ id })) }
        },
        update: {
            title,
            content,
            equipments: { set: equipmentsIds.map((id) => ({ id })) }
        }
    })

    return res.status(201).send()
}

const upsertChannelAnalog = async (req: FastifyRequest, res: FastifyReply) => {

    const { channelSchemaId, stationId, order } = z.object({
        channelSchemaId: z.coerce.number().default(0),
        stationId: z.coerce.number().default(0),
        order: z.coerce.number().default(0)
    }).parse(req.body)

    await db.channelAnalogOnChannelSchema.upsert({
        where: {
            channelSchemaId_stationId: {
                channelSchemaId,
                stationId
            }
        },
        create: {
            channelSchemaId,
            stationId,
            order
        },
        update: {
            order
        }
    })

    return res.status(201).send()
}

const upsertChannelDigital = async (req: FastifyRequest, res: FastifyReply) => {

    const { channelSchemaId, stationId, groupId, order } = z.object({
        channelSchemaId: z.coerce.number().default(0),
        stationId: z.coerce.number().default(0),
        groupId: z.coerce.number().default(0),
        order: z.coerce.number().default(0)
    }).parse(req.body)

    db.channelDigitalOnChannelSchema.upsert({
        where: {
            channelSchemaId_stationId_groupId: {
                channelSchemaId,
                stationId,
                groupId
            }
        },
        create: {
            channelSchemaId,
            stationId,
            groupId,
            slot: 0,
            order
        },
        update: {
            order
        }
    })

    return res.status(201).send()
}

export {
    getChannelsSchema,
    upsertChannelSchema,
    upsertChannelAnalog,
    upsertChannelDigital
} 