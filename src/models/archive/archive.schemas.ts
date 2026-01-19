import { z } from "zod"
import { Archives } from "@/../prisma/generated/client"

const archiveCore = z.object({
    title: z.string(),
    type: z.string(),
    size: z.string(),
    path: z.string(),
    pathUrl: z.string(),
    updatedCuid: z.string(),
    createdCuid: z.string(),
    ownerCuid: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
})

export const createArchiveSchema = archiveCore

export const archiveResponse = archiveCore.extend({
    cuid: z.string()
})
