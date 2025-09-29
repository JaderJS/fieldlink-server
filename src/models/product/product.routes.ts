import { FastifyInstance } from "fastify"
import { deleteProduct, getProductById, getProducts, upsertProduct } from "@/models/product/product.controller"
import { getCategories } from "./category.controller"

const productRoutes = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, getProducts)
    server.get('/:id', { onRequest: [server.auth] }, getProductById)
    server.post('/', { onRequest: [server.auth] }, upsertProduct)
    server.delete('/:id', { onRequest: [server.auth] }, deleteProduct)

    //category
    server.get('/category', { onRequest: [server.auth] }, getCategories)
}

export default productRoutes