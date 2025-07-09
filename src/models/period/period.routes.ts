import { FastifyInstance } from "fastify"
import { getTransactions } from "@/models/transaction/transaction.controller"
import { getAllPeriods } from "@/models/period/period.controller"

const period = async (server: FastifyInstance) => {
    server.get('/', getAllPeriods)
}

export default period