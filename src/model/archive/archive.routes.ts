import { FastifyInstance } from "fastify"
import { getArchives, uploadArchive, upsertArchive } from "./archive.controller"

const archive = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, getArchives)
    server.post('/', { onRequest: [server.auth] }, upsertArchive)
    server.post('/upload', { onRequest: [server.auth] }, uploadArchive)
}

export default archive