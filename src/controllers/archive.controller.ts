import { User } from '@/models/user-model'
import { FastifyRequest, FastifyReply } from 'fastify'
import { hash, compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'
import config from '../../config'
import { prisma } from '@/plugins/prisma.plugins'
import { Bucket } from '@/core/aws'
import { createId } from '@paralleldrive/cuid2'

const MAX_IMAGE_SIZE_ARCHIVE = 1024 * 1024 * 4

const getArchives = async (req: FastifyRequest, res: FastifyReply) => {
    const query = z
        .object({
            filters: z.object({
                transaction: z.object({
                    id: z.coerce.number()
                }).optional()
            }).optional()
        }).optional()
        .parse(req.query)

    if (!query) {
        const archivesQuery = await prisma.archives.findMany()
        return res.send({ archives: archivesQuery })
    }
    const archivesQuery = await prisma.archives.findMany({ where: { transaction: { some: { id: query.filters?.transaction?.id } } } })

    return res.send({ archives: archivesQuery })
}

const upsertArchive = async (req: FastifyRequest, res: FastifyReply) => {
    const { cuid, title, path, pathUrl, size, type, transactionConnect, isDelete } = z
        .object({
            cuid: z.string().default(""),
            title: z.string(),
            path: z.string(),
            pathUrl: z.string().url(),
            type: z.string(),
            size: z.string(),
            transactionId: z.coerce.number().optional(),
            isDelete: z.boolean().optional()
        })
        .transform(({ transactionId, ...prev }) => ({
            ...prev,
            ...(transactionId ? { transactionConnect: { connect: { id: transactionId } } } : undefined)
        }))
        .parse(req.body)

    if (isDelete) {
        await prisma.archives.delete({ where: { cuid } })
        return res.status(204).send()
    }

    await prisma.archives.upsert({
        where: { cuid },
        create: {
            path,
            pathUrl,
            size,
            type,
            title,
            createdCuid: req.user.cuid,
            updatedCuid: req.user.cuid,
            ownerCuid: req.user.cuid,
            transaction: transactionConnect
        },
        update: {
            path,
            pathUrl,
            size,
            type,
            title,
            updatedCuid: req.user.cuid,
            transaction: transactionConnect
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
        return res.status(500).send({ msg: 'Ops! You need attempt now' })
    }
}

export { getArchives, upsertArchive, uploadArchive }