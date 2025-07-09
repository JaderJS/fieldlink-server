import { FastifyInstance } from "fastify"
import { getTransaction, getTransactions, upsertTransaction, upsertTransactionPeriod } from "@/models/transaction/transaction.controller"

const transactions = async (server: FastifyInstance) => {
    server.get('/', { onRequest: server.auth }, getTransactions)
    server.get('/:id', { onRequest: server.auth }, getTransaction)
    // server.post('/', { onRequest: server.auth }, createOneTransaction)
    server.post('/', { onRequest: [server.auth, server.authorize(['ROOT', 'ADMIN'])] }, upsertTransaction)
    // server.post('/update/:id', { onRequest: [server.auth, server.google] }, updateTransaction)
    server.post('/upsert/period', { onRequest: server.auth }, upsertTransactionPeriod)
}

export default transactions