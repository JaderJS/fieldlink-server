import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/plugins/prisma.plugins'

const getMyDailies = async (req: FastifyRequest, res: FastifyReply) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { cuid: req.user.cuid }, include: { myDailies: {} } })
    return res.send({ myDailies: user.myDailies })
}

const getMyDaily = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)
    const myDaily = await prisma.daily.findUniqueOrThrow({ where: { id } })
    return res.send({ myDaily: myDaily })
}

const upsertDaily = async (req: FastifyRequest, res: FastifyReply) => {
    const { id, title, description, content } = z.object({
        id: z.coerce.number().default(0),
        title: z.string(),
        description: z.string().optional(),
        content: z.string()
    }).parse(req.body)

    const daily = await prisma.daily.findFirst({ where: { id } })
    if (!!daily && daily?.ownerCuid !== req.user.cuid) {
        return res.status(403).send({ msg: `Acesso negado, você não tem permissão para alterar esse arquivo` })
    }
    await prisma.daily.upsert({
        where: { id },
        create: {
            title,
            description,
            content,
            ownerCuid: req.user.cuid
        },
        update: {
            title,
            description,
            content,
        }
    })

    return res.status(201).send()

}

const deleteDaily = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)

    const { ownerCuid } = await prisma.daily.findFirstOrThrow({ where: { id } })
    if (req.user.cuid !== ownerCuid) {
        return res.status(203).send({ msg: "Acesso negado" })
    }

    await prisma.daily.update({ where: { id }, data: { isActive: false } })
    return res.status(204).send()
}


export { getMyDailies, getMyDaily, upsertDaily, deleteDaily }