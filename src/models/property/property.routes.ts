import { FastifyInstance } from "fastify"
import { propertyController } from "./property.controller"

const propertyRoutes = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, propertyController.getAll)
    server.post('/', { onRequest: [server.auth] }, propertyController.upsert)
    server.delete('/:id', { onRequest: [server.auth] }, propertyController.delete)
}

export default propertyRoutes