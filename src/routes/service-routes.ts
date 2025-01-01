import { upsertService, deleteOneService, getServices } from "@/controllers/service-controller"
import { FastifyInstance } from "fastify"

const services = async (server: FastifyInstance) => {
    server.post('/', { onRequest: [server.auth] }, upsertService)
    server.get('/', { onRequest: [server.auth] }, getServices)
    server.delete('/:_id', { onRequest: [server.auth] }, deleteOneService)
}

export default services