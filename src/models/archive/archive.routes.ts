import { deleteArchive, getArchives, uploadArchive, upsertArchive } from "./archive.controller"
import { FastifyInstance } from "fastify"

const archive = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, getArchives)

    server.post('/', { onRequest: [server.auth] }, upsertArchive)

    server.post('/upload', { onRequest: [server.auth] }, uploadArchive)

    server.delete('/:cuid', { onRequest: [server.auth] }, deleteArchive)
}

export default archive