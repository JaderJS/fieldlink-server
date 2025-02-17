import { FastifyInstance } from "fastify"
import { createOneTransaction, getTransactions } from "@/controllers/transaction.controller"
import { getAllPeriods } from "@/controllers/period.controller"

const period = async (server: FastifyInstance) => {
    server.get('/', getAllPeriods)
}

export default period