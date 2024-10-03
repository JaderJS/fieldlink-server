import { S3Client } from "@aws-sdk/client-s3"
import config from "@/../config"
import { Upload } from "@aws-sdk/lib-storage"
import { MultipartFile } from "@fastify/multipart"


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

}
export { s3, S3Client }