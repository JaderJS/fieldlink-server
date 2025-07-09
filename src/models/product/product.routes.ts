import { FastifyInstance } from "fastify"
import { deleteProduct, getProducts, upsertProduct } from "@/models/product/product.controller"

const productRoutes = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, getProducts)
    server.post('/', { onRequest: [server.auth] }, upsertProduct)
    server.delete('/:id', { onRequest: [server.auth] }, deleteProduct)
}

export default productRoutes