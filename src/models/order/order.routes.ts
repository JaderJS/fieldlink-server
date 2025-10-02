import { FastifyInstance } from "fastify"
import { deleteOrder, getOrderById, getOrders, sendEmailOrder, upsertOrder } from "./order.controller"

const orderRoutes = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, getOrders)
    server.get('/:id', { onRequest: [server.auth] }, getOrderById)
    server.post('/', { onRequest: [server.auth] }, upsertOrder)
    server.delete('/:id', { onRequest: [server.auth] }, deleteOrder)

    server.post(`/:id/send/email`, { onRequest: [server.auth] }, sendEmailOrder)
}

export default orderRoutes