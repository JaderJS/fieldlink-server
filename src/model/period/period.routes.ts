import { FastifyInstance } from "fastify"
import { getTransactions } from "@/model/transaction/transaction.controller"
import { getAllPeriods } from "@/model/period/period.controller"

const period = async (server: FastifyInstance) => {
    server.get('/', getAllPeriods)
}

export default period