import { upsertService, deleteOneService, getService, getServicesV2 } from "@/controllers/service-controller"
import { FastifyInstance } from "fastify"

const services = async (server: FastifyInstance) => {
    server.get('/:id', { onRequest: [server.auth] }, getService)
    server.post('/', { onRequest: [server.auth] }, upsertService)
    server.get('/', { onRequest: [server.auth] }, getServicesV2)
    server.delete('/:id', { onRequest: [server.auth] }, deleteOneService)
}

export default services