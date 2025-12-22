import { FastifyInstance } from "fastify"
import { deleteInstallment, getInstallment, getInstallments, upsertInstallment } from "@/models/installment/installment.controller"

const installmentRoutes = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, getInstallments)
    server.get('/:id', { onRequest: [server.auth] }, getInstallment)
    server.post('/', { onRequest: [server.auth] }, upsertInstallment)
    server.delete('/:id', { onRequest: [server.auth] }, deleteInstallment)
}

export default installmentRoutes