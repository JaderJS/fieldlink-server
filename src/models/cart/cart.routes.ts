import { FastifyInstance } from "fastify"
import { deleteCart, getCartById, getCarts, upsertCart } from "./cart.controller"

const cartRoutes = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, getCarts)
    server.get('/:id', { onRequest: [server.auth] }, getCartById)
    server.post('/', { onRequest: [server.auth] }, upsertCart)
    server.delete('/:id', { onRequest: [server.auth] }, deleteCart)
}

export default cartRoutes