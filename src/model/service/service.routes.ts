import { deleteOneService, upsertServiceNEW, getServices, getServiceNEW } from "@/model/service/service.controller"
import { FastifyInstance } from "fastify"

const services = async (server: FastifyInstance) => {
    server.get('/:id', { onRequest: [server.auth] }, getServiceNEW)
    server.get('/', { onRequest: [server.auth] }, getServices)
    server.post('/', { onRequest: [server.auth, server.authorize(['ADMIN','ROOT'])] }, upsertServiceNEW)
    server.delete('/:id', { onRequest: [server.auth, server.authorize(['ADMIN', 'ROOT'])] }, deleteOneService)
}

export default services