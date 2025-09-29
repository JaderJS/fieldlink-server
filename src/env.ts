import z from "zod"

const envSchema = z.object({

    URL_MINIO: z.string(),
    URL_PUBLIC_MINIO: z.string(),
    ACCESS_KEY_MINIO: z.string(),
    SECRET_KEY_MINIO: z.string(),
    REGION_MINIO: z.string(),
    PORT: z.coerce.number(),
    URL_MONGO: z.string(),
    KEY_TOKEN: z.string(),
    LOGGER: z.coerce.boolean().default(false),

    GOOGLE_KEY: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),

    URL_FRONT: z.string(),
    DATABASE_URL: z.string(),

    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_URI: z.url()
})

export const env = envSchema.parse(process.env)