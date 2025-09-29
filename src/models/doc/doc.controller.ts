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

    console.log(docQuery)
    return res.send({ doc: docQuery })
}

const upsertDoc = async (req: FastifyRequest, res: FastifyReply) => {
    const user = req.user
    // console.log('Raw body:', req.body)
    // console.log('Type of content:', typeof req.body?.content)
    // console.log('Content value:', req.body?.content)
    const { cuid, title, slug, content, isDeleted } = z.object({
        cuid: z.string().default(""),
        slug: z.string(),
        title: z.string(),
        content: z.record(z.string(), z.any()),
        isDeleted: z.boolean().default(false)
    }).parse(req.body)

    const doc = await db.doc.upsert({
        where: { cuid },
        create: {
            title,
            createdCuid: user.cuid,
            updatedCuid: user.cuid,
            slug,
            content,
        },
        update: {
            title,
            updatedCuid: user.cuid,
            content,
            isDeleted: isDeleted
        },
    })

    return res.status(200).send({ doc })
}


export {
    getDocs,
    getDocByCuid,
    upsertDoc
}