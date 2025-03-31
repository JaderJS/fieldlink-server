import { FastifyInstance } from "fastify"
import { getClients, upsertClient } from "./client.controller"

const client = async (server: FastifyInstance) => {
    server.get('/', getClients)
    server.post('/', upsertClient)
}

export default client