import { env } from "@/env"
import { Client } from "minio"
import { writeFile, mkdir } from "node:fs/promises"
import { dirname } from "node:path"

export type StorageProvider = {

    upload(params: {
        key: string,
        buffer: Buffer,
        contentType: string,
        folder?: string
    }): Promise<{ url: string }>

    delete?(key?: string): Promise<void>
}

// ====================================================
// Bucket
// ====================================================

const minio = new Client({
    endPoint: env.URL_PUBLIC_MINIO.replace(/^https?:\/\//, ""),
    useSSL: true,
    port: 443,
    accessKey: env.ACCESS_KEY_MINIO,
    secretKey: env.SECRET_KEY_MINIO
})

type UploadParams = {
    key: string
    buffer: Buffer
    contentType: string
    folder?: string
}

export class BucketStorageProvider implements StorageProvider {

    async upload({ key, buffer, contentType, folder }: UploadParams) {
        const bucket = "fieldlink"

        const exist = await minio.bucketExists(bucket)
        if (!exist) {
            await minio.makeBucket(bucket)
        }

        const safeFolder = folder ? folder.replace(/^\/*|\/*$/g, "").replace(/\.\./g, "") : ""

        const objectKey = safeFolder ? `${safeFolder}/${key}` : key

        await minio.putObject(
            bucket,
            objectKey,
            buffer,
            buffer.length,
            { contentType }
        )

        return {
            url: `/${bucket}/${objectKey}`,
        }
    }
}


export class LocalStorageProvider implements StorageProvider {

    async upload({ key, buffer }: any) {
        const path = `uploads/${key}`
        await mkdir(dirname(path), { recursive: true })
        await writeFile(path, buffer)

        return {
            url: `/uploads/${key}`,
        }
    }
}

