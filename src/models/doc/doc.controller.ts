import { db } from '@/plugins/prisma.plugins'
import { Order, Prisma } from '@prisma/client'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { DEFAULT } from './constants/default'

const getDocs = async (req: FastifyRequest, res: FastifyReply) => {

    const docsQuery = await db.doc.findMany()

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
    const { cuid, title, content } = z.object({
        cuid: z.string().default(""),
        title: z.string(),
        content: z.string(),
    }).parse(req.body)


    const doc = await db.doc.upsert({
        where: { cuid },
        create: {
            title,
            content,
        },
        update: {
            title,
            content,
        },
    })

    return res.status(200).send({ doc })
}


export {
    getDocs,
    getDocByCuid,
    upsertDoc
}