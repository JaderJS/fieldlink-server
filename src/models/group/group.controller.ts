import { IGroup, IProperty, Property } from '@/models/property-models'
import { User } from '@/models/user-model'
import { db } from '@/plugins/prisma.plugins'
import { FastifyRequest, FastifyReply } from 'fastify'
import { Types } from 'mongoose'
import { object, z } from 'zod'

const getGroups = async (req: FastifyRequest, res: FastifyReply) => {
    const query = z.object({
        station: z.object({
            id: z.coerce.number()
        }).optional()
    }).optional().parse(req.query)

    const groups = await db.group.findMany({
        where: Object.keys(query ?? {}).length !== 0 ? { stations: { some: { id: query?.station?.id } } } : undefined
    })

    return res.send({ groups })
}

const upsertGroup = async (req: FastifyRequest, res: FastifyReply) => {

    const { id, title, type, identifier, stationId } = z.object({
        id: z.coerce.number().default(0),
        title: z.string(),
        type: z.enum(['group', 'all', 'private']),
        identifier: z.coerce.number(),
        stationId: z.coerce.number().optional(),
    }).parse(req.body)

    await db.group.upsert({
        where: { id },
        create: {
            identifier,
            title,
            type,
            stations: !!stationId ? { connect: { id: stationId } } : undefined
        },
        update: {
            identifier,
            title,
            type
        }
    })

    return res.status(201).send()

}

const deleteGroup = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({
        id: z.coerce.number()
    }).parse(req.params)

    await db.group.delete({ where: { id } })
    return res.status(204).send()
}

export {
    getGroups,
    upsertGroup,
    deleteGroup
}