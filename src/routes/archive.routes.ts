import { getArchives, uploadArchive, upsertArchive } from "@/controllers/archive.controller"
import { login } from "@/controllers/auth-controller"
import { getBanks, upsertBank } from "@/controllers/bank-controller"
import { FastifyInstance } from "fastify"

const archive = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, getArchives)
    server.post('/', { onRequest: [server.auth] }, upsertArchive)
    server.post('/upload', { onRequest: [server.auth] }, uploadArchive)
}

export default archive