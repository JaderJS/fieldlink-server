import { FastifyInstance } from "fastify"
import { deleteOrder, getOrderById, getOrders, sendEmailOrder, upsertOrder } from "./order.controller"
import { getOrderStatus, upsertOrderStatus } from "./order.status.controller"
import { getOrderAnalytics } from "./order.analytics.controller"

const orderRoutes = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, getOrders)
    server.get('/:id', { onRequest: [server.auth] }, getOrderById)
    server.post('/', { onRequest: [server.auth] }, upsertOrder)
    server.delete('/:id', { onRequest: [server.auth] }, deleteOrder)

    //Order status
    server.get('/status', { onRequest: [server.auth] }, getOrderStatus)
    server.post('/status', { onRequest: [server.auth] }, upsertOrderStatus)

    //Order analytics
    server.get('/:id/analytics', { onRequest: [server.auth] }, getOrderAnalytics)

    server.post(`/:id/send/email`, { onRequest: [server.auth] }, sendEmailOrder)
}

export default orderRoutes