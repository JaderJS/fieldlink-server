import { db } from '@/plugins/prisma.plugins'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const getGroups = async (req: FastifyRequest, res: FastifyReply) => {
    const query = z.object({
        stationId: z.coerce.number().optional()
    }).optional().parse(req.query)

    const groupsQuery = await db.group.findMany({
        where: !!query?.stationId ? { stations: { every: { id: query.stationId } } } : undefined
    })

    return res.send({ groups: groupsQuery })
}

const getGroup = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)

    const groupsQuery = await db.group.findMany({
        where: { id }
    })

    return res.send({ group: groupsQuery })
}

const upsertGroup = async (req: FastifyRequest, res: FastifyReply) => {

    const { id, title, type, identifier, stationId } = z.object({
        id: z.coerce.number().default(-1),
        title: z.string(),
        type: z.enum(['group', 'all', 'private']),
        identifier: z.coerce.string(),
        stationId: z.coerce.number().optional(),
    }).parse(req.body)

    const groupMutation = await db.group.upsert({
        where: { id },
        create: {
            identifier: Number(identifier),
            title,
            type,
            stations: !!stationId ? { connect: { id: stationId } } : undefined
        },
        update: {
            identifier: Number(identifier),
            title,
            type
        }
    })

    return res.status(201).send({ group: groupMutation })

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
    getGroup,
    upsertGroup,
    deleteGroup
}