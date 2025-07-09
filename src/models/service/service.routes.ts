import { deleteOneService, upsertServiceNEW, getServices, getService } from "@/models/service/service.controller"
import { FastifyInstance } from "fastify"

const services = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, getServices)
    server.get('/:id', { onRequest: [server.auth] }, getService)
    server.post('/', { onRequest: [server.auth, server.authorize(['ADMIN', 'ROOT'])] }, upsertServiceNEW)
    server.delete('/:id', { onRequest: [server.auth, server.authorize(['ADMIN', 'ROOT'])] }, deleteOneService)
}

export default services