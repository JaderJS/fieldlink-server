import { getProducts, safeDeleteProduct, upsertProduct } from "@/controllers/product-controller"
import { FastifyInstance } from "fastify"

const product = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, getProducts)
    server.post('/', { onRequest: [server.auth] }, upsertProduct)
    server.post('/:_id/delete', { onRequest: [server.auth] }, safeDeleteProduct)
}

export default product