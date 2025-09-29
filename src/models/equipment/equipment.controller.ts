import { db } from '@/plugins/prisma.plugins'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const getEquipments = async (req: FastifyRequest, res: FastifyReply) => {
    const query = z.object({
        station: z.object({
            id: z.coerce.number()
        }).optional()
    })
        .transform((args) => {
            if (!args.station) {
                return undefined
            }
            return {
                stations: { some: { id: args.station.id } }
            }
        })
        .optional().parse(req.query)
    const equipments = await db.equipment.findMany({
        where: query, include: { product: {}, channelSchema: {}, stations: {}, archives: {} }
    })
    return res.send({ equipments })
}

const getEquipment = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)

    const queryEquipment = await db.equipment.findUniqueOrThrow({ where: { id } })

    return res.send({ equipment: queryEquipment })
}

const upsertEquipment = async (req: FastifyRequest, res: FastifyReply) => {

    const { id, sn, nickname, identifier, productId, insertInStations } = z.object({
        id: z.coerce.number().default(-1),
        sn: z.string(),
        nickname: z.string(),
        identifier: z.coerce.number(),
        productId: z.coerce.number(),
        insertInStations: z.array(z.coerce.number()),
    }).parse(req.body)

    const equipment = await db.equipment.findFirst({ where: { OR: [{ sn }, { identifier }] } })
    if (!!equipment) {
        const slug = equipment.sn ? `${sn} registrado` : `${identifier} registrado`
        return res.status(502).send({ msg: `Já existe outro equipamento com o ${slug}` })
    }

    await db.equipment.upsert({
        where: { id },
        create: {
            identifier,
            sn,
            nickname,
            productId,
            stations: { connect: insertInStations.map((id: number) => ({ id })) }
        },
        update: {
            identifier,
            sn,
            nickname,
            productId,
        }
    })
    return res.status(201).send()
}

const deleteEquipment = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)

    await db.equipment.delete({ where: { id } })

    return res.status(204).send()
}

const upsertChannel = async (req: FastifyRequest, res: FastifyReply) => {

    const { id, title, order, content } = z.object({
        id: z.coerce.number().default(0),
        title: z.string(),
        content: z.string(),
        order: z.coerce.number().default(0),
    }).parse(req.body)

    // const channel = await db.channel.upsert({
    //     where: { id },
    //     create: {
    //         order,
    //         title,
    //         content
    //     },
    //     update: {
    //         order,
    //         title,
    //         content
    //     }
    // })

}

export {
    getEquipments,
    getEquipment,
    upsertEquipment,
    deleteEquipment
}