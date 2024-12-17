import { login } from "@/controllers/auth-controller"
import { getTransaction } from "@/controllers/transactions-controller"
import { upsertBank } from "@/controllers/bank-controller"
import { FastifyInstance } from "fastify"

const transactions = async (server: FastifyInstance) => {
    server.get('/:_id', getTransaction)
}

export default transactions