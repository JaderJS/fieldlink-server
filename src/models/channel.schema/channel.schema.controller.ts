import { db } from '@/plugins/prisma.plugins'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const getChannelsSchemas = async (req: FastifyRequest, res: FastifyReply) => {

    const filters = z.object({
        stationId: z.coerce.number().optional()
    }).optional().parse(req.query)

    const channelsSchemas = await db.channelSchema.findMany({
        where: !!filters ? { stationId: filters.stationId } : undefined,
        include: { channelsAnalog: true, channelsDigital: true }
    })
    return res.send({ channelsSchemas: channelsSchemas })
}

const getChannelSchemaById = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)

    const channelSchemaQuery = await db.channelSchema.findUniqueOrThrow({
        where: { id },
        include: { channelsAnalog: true, channelsDigital: true }
    })

    return res.send({ channelSchema: channelSchemaQuery })
}

const upsertChannelSchema = async (req: FastifyRequest, res: FastifyReply) => {

    const { id, title, content, stationId, channelsAnalog, channelsDigital } = z.object({
        id: z.coerce.number().default(-1),
        title: z.string(),
        content: z.record(z.string(), z.any()),
        stationId: z.coerce.number(),
        channelsAnalog: z.array(z.object({
            channelSchemaId: z.coerce.number().default(-1),
            silent: z.enum(['CSQ', 'TPL', 'DPL_N', 'DPL_I']),
            encoder: z.coerce.number().default(0),
            decoder: z.coerce.number().default(0),
            order: z.coerce.number().optional()
        })).default([]),
        channelsDigital: z.array(z.object({
            channelSchemaId: z.coerce.number().default(-1),
            slot: z.coerce.number().default(0),
            colorCode: z.coerce.number().default(0),
            groupId: z.coerce.number(),
            order: z.coerce.number().optional()
        })).default([]),
    }).parse(req.body)

    const channelSchemaMutation = await db.channelSchema.upsert({
        where: { id },
        create: {
            title,
            content,
            stationId,
        },
        update: {
            title,
            content,
        }
    })

    const resolveChannelsAnalog = channelsAnalog.map(async (channel) => {
        return db.channelAnalogOnChannelSchema.upsert({
            where: {
                channelSchemaId: channel.channelSchemaId,
            },
            create: {
                schema: { connect: { id: channelSchemaMutation.id } },
                silent: channel.silent,
                decoder: channel.decoder,
                encoder: channel.encoder,
            },
            update: {
                silent: channel.silent,
                decoder: channel.decoder,
                encoder: channel.encoder,
            }
        })
    })

    const resolveChannelsDigital = channelsDigital.map(async (channel) => {
        return db.channelDigitalOnChannelSchema.upsert({
            where: {
                channelSchemaId_groupId: {
                    channelSchemaId: channel.channelSchemaId,
                    groupId: channel.groupId
                }
            },
            create: {
                schema: { connect: { id: channelSchemaMutation.id } },
                group: { connect: { id: channel.groupId } },
                colorCode: channel.colorCode,
                slot: channel.slot,
            },
            update: {
                group: { connect: { id: channel.groupId } },
                colorCode: channel.colorCode,
                slot: channel.slot,
            }
        })
    })

    await Promise.all([resolveChannelsDigital, resolveChannelsAnalog])

    return res.status(200).send({ channelSchema: channelSchemaMutation })
}

const deleteChannelSchema = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)
    return res.send({})
}

export {
    getChannelsSchemas,
    getChannelSchemaById,
    upsertChannelSchema,
    deleteChannelSchema
}