import { GetObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3"
import config from "@/../config"
import { Upload } from "@aws-sdk/lib-storage"
import { MultipartFile } from "@fastify/multipart"
import path from "node:path"
import { pipeline } from "stream/promises"
import fs from "fs"

const s3 = new S3Client({
    region: config.REGION_MINIO,
    credentials: {
        accessKeyId: config.ACCESS_KEY_MINIO,
        secretAccessKey: config.SECRET_KEY_MINIO
    },
    endpoint: config.URL_MINIO,
    forcePathStyle: true
})

type UploadProps = {
    path: string,
    pathUrl: string
}

export class Bucket {
    static s3 = new S3Client({
        region: config.REGION_MINIO,
        credentials: {
            accessKeyId: config.ACCESS_KEY_MINIO,
            secretAccessKey: config.SECRET_KEY_MINIO
        },
        endpoint: config.URL_MINIO,
        forcePathStyle: true
    })

    static uploadImage = async (file: MultipartFile): Promise<Error | UploadProps> => {
        if (!file.mimetype.includes("image")) {
            throw new Error('Your file not image')
        }
        const bucket = 'fieldlink'
        const key = `assets/${file.filename}`
        const pathUrl = `${config.URL_MINIO}/${bucket}/${key}`

        await new Upload({
            client: s3,
            params: {
                Bucket: bucket,
                Key: key,
                Body: file.file,
                ContentType: file.mimetype,
                ACL: 'public-read',
            },
        }).done()
        return ({ path: key, pathUrl })
    }

    static uploadFile = async (file: MultipartFile): Promise<Error | UploadProps> => {
        if (!file) {
            throw new Error('Your not File')
        }
        const bucket = 'fieldlink'
        const key = `assets/${file.filename}`
        const pathUrl = `${config.URL_MINIO}/${bucket}/${key}`

        await new Upload({
            client: s3,
            params: {
                Bucket: bucket,
                Key: key,
                Body: file.file,
                ContentType: file.mimetype,
                ACL: 'public-read',
            },
        }).done()
        return ({ path: key, pathUrl })
    }

    static downloadBucket = async (bucket: string, destination: string) => {
        const list = await s3.send(new ListObjectsV2Command({
            Bucket: bucket
        }))

        if (!list.Contents) return

        for (const obj of list.Contents) {
            console.log(obj)
            if (!obj.Key) continue

            const localFilePath = path.join(destination, obj.Key)
            const dir = path.dirname(localFilePath)
            await fs.promises.mkdir(dir, { recursive: true })

            const { Body } = await s3.send(new GetObjectCommand({
                Bucket: bucket,
                Key: obj.Key
            }))
            if (!Body) continue
            try {
                await pipeline(Body as any, fs.createWriteStream(localFilePath))
                console.log(`✅ Baixado: ${obj.Key}`)
            } catch (err) {
                console.error(`❌ Erro ao baixar ${obj.Key}:`, err)
            }
        }
    }

}
export { s3, S3Client }