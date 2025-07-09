import { FastifyInstance } from "fastify"
import { getDocByCuid, getDocs, upsertDoc } from "./doc.controller"

const docRoutes = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, getDocs)
    server.get('/:cuid', { onRequest: [server.auth] }, getDocByCuid)
    server.post('/', { onRequest: [server.auth] }, upsertDoc)
}

export default docRoutes