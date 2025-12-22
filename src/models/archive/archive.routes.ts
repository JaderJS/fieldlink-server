import { deleteArchive, getArchives, uploadArchive, upsertArchive } from "./archive.controller"
import { FastifyTypedInstance } from "@/../types"
import { GetArchiveQuerySchema } from "./schemas/getArchives"
import { Prisma, Archives } from "@/../prisma/generated/client"
import { archiveResponse } from "./archive.schemas"
import { z } from "zod"
import { FastifyInstance } from "fastify"

const archive = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, getArchives)

    server.post('/', { onRequest: [server.auth] }, upsertArchive)

    server.post('/upload', { onRequest: [server.auth] }, uploadArchive)

    server.delete('/:cuid', { onRequest: [server.auth] }, deleteArchive)
}

export default archive