import { login } from "@/controllers/auth-controller"
import { upsertBank } from "@/controllers/bank-controller"
import { FastifyInstance } from "fastify"

const bank = async (server: FastifyInstance) => {
    server.post('/', upsertBank)
}

export default bank