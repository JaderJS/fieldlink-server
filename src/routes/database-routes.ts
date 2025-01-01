import { deleteOneCard, deleteOneDatabase, getDatabase, getDatabases, moveColumn, upsertCard, upsertDatabase } from "@/controllers/database-controller"
import { FastifyInstance } from "fastify"

const databases = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, getDatabases)
    server.get('/:_id', { onRequest: [server.auth] }, getDatabase)
    server.post('/', { onRequest: [server.auth] }, upsertDatabase)
    server.post('/move', { onRequest: [server.auth] }, moveColumn)
    server.post('/card', { onRequest: [server.auth] }, upsertCard)
    server.delete('/card/:_id', { onRequest: [server.auth] }, deleteOneCard)
    server.delete('/:_id', { onRequest: [server.auth] }, deleteOneDatabase)
}

export default databases