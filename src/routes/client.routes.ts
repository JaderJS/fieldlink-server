import { login } from "@/controllers/auth-controller"
import { getClients, upsertClient } from "@/controllers/client.controller"
import { FastifyInstance } from "fastify"

const client = async (server: FastifyInstance) => {
    server.get('/', getClients)
    server.post('/', upsertClient)
}

export default client