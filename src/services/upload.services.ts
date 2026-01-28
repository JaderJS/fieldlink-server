import { StorageProvider } from "@/core/bucket"
import { ImageProcess } from "@/core/image"
import { env } from "@/env"
import { Multipart, MultipartFile } from "@fastify/multipart"
import z from "zod"

const bodyUploadSchema = z.object({
    pathUrl: z.url(),
    path: z.string(),
    size: z.string(),
    mimetype: z.string(),
})

const bodyUploadSchemaWithVariantsSchema = z.object({
    variants: z.record(z.string(), bodyUploadSchema)
})

const responseUploadSchema = z.union([
    z.object({ key: z.string() }),
    bodyUploadSchema,
    bodyUploadSchemaWithVariantsSchema
])

type ResponseUploadDTO = z.infer<typeof responseUploadSchema>

export abstract class UploadService {
    static MAX_SIZE = 50 * 1024 * 1024

    static ALLOWED_MIME_TYPES = [
        "image/png",
        "image/jpeg",
        "image/webp",
    ]

    static storage: StorageProvider

    static configure(storage: StorageProvider) {
        this.storage = storage
    }

    static async uploadImg(file: MultipartFile, options: { genVariants: boolean } = { genVariants: false }): Promise<ResponseUploadDTO> {
        if (file.file.bytesRead > this.MAX_SIZE) {
            throw new Error("File to large")
        }

        if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new Error("Invalid file type")
        }

        const baseKey = Bun.randomUUIDv7()
        const buffer = await file.toBuffer()
        const processed = await ImageProcess.process(buffer)

        if (!options.genVariants) {
            const buffer = processed.original?.buffer
            const { url } = await this.storage.upload({ key: baseKey, buffer, contentType: file.type, folder: "assets" })

            return ({
                key: baseKey,
                path: `${url}`,
                pathUrl: `${env.URL_PUBLIC_MINIO}${url}`,
                size: processed.original.sizeKb,
                mimetype: "image/webp"
            })
        }

        const uploaded: Record<string, any> = {}

        for (const [variant, data] of Object.entries(processed.variants)) {
            const key = `/assets/${baseKey}_${variant}.webp`

            const { url } = await this.storage.upload({
                key,
                buffer: data.buffer,
                contentType: "image/webp",
            })

            uploaded[variant] = {
                key: data.key,
                path: key,
                pathUrl: `${env.URL_PUBLIC_MINIO}${url}`,
                size: data.sizeKb,
                mimetype: "image/" + data.format
            }
        }

        return {
            key: baseKey,
            variants: uploaded,
        }
    }
}