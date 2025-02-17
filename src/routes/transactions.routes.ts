import { FastifyInstance } from "fastify"
import { createOneTransaction, getTransaction, getTransactions, updateTransaction, upsertTransactionPeriod } from "@/controllers/transaction.controller"

const transactions = async (server: FastifyInstance) => {
    server.get('/', { onRequest: server.auth }, getTransactions)
    server.get('/:id', { onRequest: server.auth }, getTransaction)
    server.post('/', { onRequest: server.auth }, createOneTransaction)
    server.post('/update/:id', { onRequest: server.auth }, updateTransaction)
    server.post('/upsert/period', { onRequest: server.auth }, upsertTransactionPeriod)
}

export default transactions