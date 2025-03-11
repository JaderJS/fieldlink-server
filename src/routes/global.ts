import { Bucket } from "@/core/aws"
import { FastifyInstance } from "fastify"
import { createId } from '@paralleldrive/cuid2'
import config from "../../config"
import { google } from "googleapis"
import { oauth2 } from "googleapis/build/src/apis/oauth2"
import { z } from "zod"
import { oauth2Client, scope } from "@/plugins/google"
import { createEvent } from "@/plugins/calendar"
import { add } from "date-fns"
import { prisma } from "@/plugins/prisma.plugins"
import { Prisma } from "@prisma/client"

const MAX_IMAGE_SIZE_UPLOAD = 1024 * 1024 * 4
const MY_CUID = "cm6b5mkd80000mqdzjoeic94y"

const global = async (server: FastifyInstance) => {
    server.post(`/upload/image`, { onResponse: [server.auth] }, async (req, res) => {
        try {
            const data = await req.file({ limits: { fileSize: MAX_IMAGE_SIZE_UPLOAD } })
            if (!data) {
                return res.status(400).send({ msg: 'Verify you image content' })
            }

            const upload = await Bucket.uploadImage({ ...data, filename: createId() })
            if (upload instanceof Error) {
                return res.status(400).send({ msg: 'You upload has failure', error: upload.message })
            }
            const pathUrl = `${config.URL_PUBLIC_MINIO}/fieldlink/${upload.path}`
            return res.send({ path: upload.path, pathUrl })
        } catch (error) {
            console.log(error)
            return res.status(500).send({ msg: 'Ops! You need attempt now' })
        }
    })
    server.post(`/upload/file`, { onResponse: [server.auth] }, async (req, res) => {
        try {
            const data = await req.file({ limits: { fileSize: MAX_IMAGE_SIZE_UPLOAD } })
            if (!data) {
                return res.status(400).send({ msg: 'Verify you file content' })
            }

            const upload = await Bucket.uploadImage({ ...data, filename: createId() })
            if (upload instanceof Error) {
                return res.status(400).send({ msg: 'You upload has failure', error: upload.message })
            }
            const pathUrl = `${config.URL_PUBLIC_MINIO}/fieldlink/${upload.path}`
            return res.send({ path: upload.path, pathUrl, size: '2mb', contentType: 'pdf/*' })
        } catch (error) {
            return res.status(500).send({ msg: 'Ops! You need attempt now' })
        }
    })
    server.get(`/google`, async (req, res) => {
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope,
            prompt: 'consent'
        })
        return res.redirect(url)
    })
    server.get(`/google/redirect`, async (req, res) => {
        const { code } = z.object({ code: z.string() }).parse(req.query)
        const { tokens } = await oauth2Client.getToken(code)

        oauth2Client.setCredentials(tokens)

        const dbGoogleTokens = await prisma.googleTokens.findFirst()
        if (dbGoogleTokens) {
            await prisma.googleTokens.update({ where: { id: dbGoogleTokens.id }, data: tokens })
        } else {
            await prisma.googleTokens.create({ data: { tokens: tokens as Prisma.JsonObject } })
        }

        return res.redirect(config.URL_FRONT)
    })

}

export default global