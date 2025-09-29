import { FastifyRequest, FastifyReply } from 'fastify'
import { hash, compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'
import config from '@/../../config'
import { db } from '@/plugins/prisma.plugins'
import { Bucket } from '@/core/aws'
import { createId } from '@paralleldrive/cuid2'

const MAX_IMAGE_SIZE_ARCHIVE = 1024 * 1024 * 4

const getArchives = async (req: FastifyRequest, res: FastifyReply) => {
    const query = z.object({
        filters: z.object({
            transaction: z.object({
                id: z.coerce.number()
            }).optional()
        }).optional()
    }).optional()
        .parse(req.query)


    if (!query) {
        const archivesQuery = await db.archives.findMany()
        return res.send({ archives: archivesQuery })
    }
    const archivesQuery = await db.archives.findMany({ where: { transaction: { some: { id: query.filters?.transaction?.id } } } })
    return res.send({ archives: archivesQuery })
}

const upsertArchive = async (req: FastifyRequest, res: FastifyReply) => {

    const user = req.user
    const { cuid, title, path, pathUrl, size, type, connect, isDelete } = z
        .object({
            cuid: z.string().default(""),
            title: z.string(),
            path: z.string(),
            pathUrl: z.url(),
            type: z.string(),
            size: z.string(),
            isDelete: z.boolean().optional(),
            connect: z.object({
                transaction: z.object({
                    id: z.coerce.number()
                }).optional()
            }).optional()
        })
        .parse(req.body)


    await db.archives.upsert({
        where: { cuid },
        create: {
            path,
            pathUrl,
            size,
            type,
            title,
            createdCuid: user.cuid,
            updatedCuid: user.cuid,
            ownerCuid: user.cuid,
            transaction: !!connect?.transaction?.id ? { connect: { id: connect.transaction?.id } } : undefined
        },
        update: {
            path,
            pathUrl,
            size,
            type,
            title,
            updatedCuid: user.cuid,
        }
    })

    return res.status(201).send()

}

const uploadArchive = async (req: FastifyRequest, res: FastifyReply) => {

    try {
        const data = await req.file({ limits: { fileSize: MAX_IMAGE_SIZE_ARCHIVE } })
        if (!data) {
            return res.status(400).send({ msg: 'Verify you file content' })
        }

        const size = `${(data.file.bytesRead / 1024).toFixed(2)} KB`
        const upload = await Bucket.uploadFile({ ...data, filename: createId() })
        if (upload instanceof Error) {
            return res.status(400).send({ msg: 'You upload has failure', error: upload.message })
        }
        const pathUrl = `${config.URL_PUBLIC_MINIO}/fieldlink/${upload.path}`

        return res.send({ path: upload.path, pathUrl, size, type: data.mimetype })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ msg: 'Ops! You need attempt now' })
    }
}


const deleteArchive = async (req: FastifyRequest, res: FastifyReply) => {

    const user = req.user
    const { cuid } = z
        .object({
            cuid: z.string()
        })
        .parse(req.params)


    await db.archives.delete({
        where: { cuid },
    })

    return res.status(200).send()

}

export { getArchives, upsertArchive, uploadArchive, deleteArchive }