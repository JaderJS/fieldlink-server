import z from "zod"

export const GetArchiveQuerySchema = z.object({
    filters: z.object({
        transaction: z.object({
            id: z.coerce.number().optional()
        })
    }).optional()
}).optional()