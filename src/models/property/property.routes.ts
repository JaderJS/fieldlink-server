import { FastifyInstance } from "fastify"
import { propertyController } from "./property.controller"

const propertyRoutes = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, propertyController.getAll)
}

export default propertyRoutes