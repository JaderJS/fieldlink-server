import { FastifyInstance } from "fastify"
import { clientController } from "./client.controller"

const clientRoutes = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, clientController.getAll)
    server.get('/:id', { onRequest: [server.auth] }, clientController.getById)
    server.post('/', { onRequest: [server.auth] }, clientController.upsert)
    server.delete('/:id', { onRequest: [server.auth] }, clientController.delete)
}

export default clientRoutes