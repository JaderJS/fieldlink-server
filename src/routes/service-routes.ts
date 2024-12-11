import { upsertService, deleteOneService } from "@/controllers/service-controller"
import { FastifyInstance } from "fastify"

const services = async (server: FastifyInstance) => {
    server.post('/', { onRequest: [server.auth] }, upsertService)
    server.delete('/:_id', { onRequest: [server.auth] }, deleteOneService)
}

export default services