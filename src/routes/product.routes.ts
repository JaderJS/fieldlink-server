import { FastifyInstance } from "fastify"
import { balanceProducts, createCategory, getPurchase, upsertPurchase, getCategoryInProducts, getProduct, getProducts, getSuppliers, updateProduct, upsertProduct, getPurchases, deletePurchase } from "@/controllers/product.controller"
import { deleteOrder, getOrder, getOrders, upsertOrder } from "@/controllers/order.controller"

const products = async (server: FastifyInstance) => {
    server.get('/', { onRequest: server.auth }, getProducts)
    server.get('/balance', { onRequest: server.auth }, balanceProducts)
    server.get('/:id', { onRequest: server.auth }, getProduct)
    server.post('/', { onRequest: server.auth }, upsertProduct)
    server.post('/:id/update', { onRequest: server.auth }, updateProduct)
    server.get('/suppliers', { onRequest: server.auth }, getSuppliers)
    server.get('/categories', { onRequest: server.auth }, getCategoryInProducts)

    server.get('/purchase', { onRequest: [server.auth] }, getPurchases)
    server.get('/purchase/:id', { onRequest: [server.auth] }, getPurchase)
    server.post('/purchase', { onRequest: server.auth }, upsertPurchase)
    server.delete('/purchase/:id', { onRequest: [server.auth] }, deletePurchase)

    server.post('/category', { onRequest: server.auth }, createCategory)

    server.get('/orders', { onRequest: [server.auth] }, getOrders)
    server.get('/order/:id', { onRequest: [server.auth] }, getOrder)
    server.post('/order', { onRequest: [server.auth] }, upsertOrder)
    server.delete('/order/:id', { onRequest: [server.auth] }, deleteOrder)
}

export default products