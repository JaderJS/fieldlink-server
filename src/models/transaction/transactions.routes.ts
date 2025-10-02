import { FastifyInstance } from "fastify"
import { deleteTransaction, getTransaction, getTransactions, upsertTransaction, upsertTransactionPeriod } from "@/models/transaction/transaction.controller"

const transactionRoutes = async (server: FastifyInstance) => {
    server.get('/', {}, getTransactions)
    server.get('/:id', { onRequest: [server.auth] }, getTransaction)
    server.post('/', { onRequest: [server.auth, server.authorize(['ROOT', 'ADMIN'])] }, upsertTransaction)
    server.delete('/:id', { onRequest: [server.auth] }, deleteTransaction)
    server.post('/upsert/period', { onRequest: [server.auth] }, upsertTransactionPeriod)
}

export default transactionRoutes