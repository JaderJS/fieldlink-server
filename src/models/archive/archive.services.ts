import { StorageProvider } from "@/core/bucket"
import { FileRequiredError, FileTooLargeError, InvalidFileType } from "@/core/errors"
import { env } from "@/env"
import { ImageProcess } from "@/core/image"

export abstract class UploadService {
    static MAX_SIZE = 5 * 1024 * 1024

    static ALLOWED_MIME_TYPES = [
        "image/png",
        "image/jpeg",
        "image/webp"
    ]

    static storage: StorageProvider

    static configure(storage: StorageProvider) {
        this.storage = storage
    }

    static async uploadFile(file?: File, options: { genVariants: boolean } = { genVariants: false }): Promise<any> {
        if (!file)
            throw new FileRequiredError

        if (file.size > this.MAX_SIZE)
            throw new FileTooLargeError(file.size, this.MAX_SIZE)

        if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
            throw new InvalidFileType(file.type, this.ALLOWED_MIME_TYPES)
        }

        const baseKey = `${Bun.randomUUIDv7()}`

        const buffer = Buffer.from(await file.arrayBuffer())
        const processed = await ImageProcess.process(buffer)

        if (!options.genVariants) {
            const buffer = processed.original?.buffer
            const { url } = await this.storage.upload({ key: baseKey, buffer, contentType: file.type })

            return ({
                key: baseKey,
                path: `${url}`,
                pathUrl: `${env.URL_PUBLIC_MINIO}/gallery${url}`,
                size: processed.original.sizeKb,
                mimetype: file.type
            })
        }

        const uploaded: Record<string, any> = {}

        for (const [variant, data] of Object.entries(processed.variants)) {
            const key = `gallery/${baseKey}_${variant}.webp`

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