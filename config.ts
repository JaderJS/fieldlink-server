import z from "zod"

const configSchema = z.object({
    
    URL_MINIO: z.string(),
    ACCESS_KEY_MINIO: z.string(),
    SECRET_KEY_MINIO: z.string(),
    REGION_MINIO: z.string()
})

const config = configSchema.parse(process.env)

export default config