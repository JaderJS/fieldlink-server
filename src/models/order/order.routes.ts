import { FastifyInstance } from "fastify"
import { getOrderById, getOrders, upsertOrder } from "./order.controller"

const orderRoutes = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, getOrders)
    server.get('/:id', { onRequest: [server.auth] }, getOrderById)
    server.post('/', { onRequest: [server.auth] }, upsertOrder)
}

export default orderRoutes