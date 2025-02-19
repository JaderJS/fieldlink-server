import { FastifyInstance } from "fastify"
import { createOneTransaction, getTransactions } from "@/controllers/transaction.controller"
import { getAllPeriods } from "@/controllers/period.controller"
import { getHealth } from "@/controllers/dashboard.controller"

const dashboard = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, getHealth)
}

export default dashboard