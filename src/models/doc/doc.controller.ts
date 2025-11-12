import { db } from '@/plugins/prisma.plugins'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const getDocs = async (req: FastifyRequest, res: FastifyReply) => {

    const docsQuery = await db.doc.findMany({ where: { client: { none: {} } } })

    return res.send({ docs: docsQuery })
}

const getDocByCuid = async (req: FastifyRequest, res: FastifyReply) => {
    const { cuid } = z.object({
        cuid: z.string(),
    }).parse(req.params)

    const docQuery = await db.doc.findUniqueOrThrow({
        where: { cuid },
    })

    return res.send({ doc: docQuery })
}

const upsertDoc = async (req: FastifyRequest, res: FastifyReply) => {
    const user = req.user
    
    const { cuid, title, slug, content, isDeleted, connect } = z.object({
        cuid: z.string().default(""),
        slug: z.string().transform(prop => prop
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")      // limpa marcas de acentuação
            .replace(/[^a-zA-Z0-9\s-]/g, "")      // remove caracteres especiais
            .trim()                               // tira espaços extras
            .replace(/\s+/g, "-")                 // substitui espaços por "-"
            .toLowerCase()
        ),
        title: z.string(),
        content: z.record(z.string(), z.any()),
        isDeleted: z.boolean().default(false),
        connect: z.object({
            clientId: z.coerce.number().optional()
        }).optional()
    }).parse(req.body)

    const doc = await db.doc.upsert({
        where: { cuid },
        create: {
            title,
            createdCuid: user.cuid,
            updatedCuid: user.cuid,
            slug,
            content,
            client: !!connect?.clientId ? { connect: { id: connect.clientId } } : undefined
        },
        update: {
            title,
            updatedCuid: user.cuid,
            content,
            isDeleted: isDeleted,
            client: !!connect?.clientId ? { connect: { id: connect.clientId } } : undefined
        },
    })

    return res.status(200).send({ doc })
}


export {
    getDocs,
    getDocByCuid,
    upsertDoc
}