import { Bucket } from "@/core/aws"
import { FastifyInstance } from "fastify"
import { createId } from '@paralleldrive/cuid2'
import config from "../../config"

const MAX_IMAGE_SIZE_UPLOAD = 1024 * 1024 * 4

const global = async (server: FastifyInstance) => {
    server.post(`/upload/image`, async (req, res) => {
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
    server.post(`/upload/file`, async (req, res) => {
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
}

export default global