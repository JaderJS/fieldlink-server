import { createOneService, deleteOneService } from "@/controllers/service-controller"
import { FastifyInstance } from "fastify"

const services = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, createOneService)
    // server.post('/', createOneService)
    server.delete('/:_id', deleteOneService)
}

export default services