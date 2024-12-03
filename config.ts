import z from "zod"

const configSchema = z.object({

    URL_MINIO: z.string(),
    URL_PUBLIC_MINIO: z.string(),
    ACCESS_KEY_MINIO: z.string(),
    SECRET_KEY_MINIO: z.string(),
    REGION_MINIO: z.string(),
    PORT: z.coerce.number(),
    URL_MONGO: z.string(),
    KEY_TOKEN: z.string(),
    LOGGER: z.coerce.boolean().default(false)
})

const config = configSchema.parse(process.env)

export default config