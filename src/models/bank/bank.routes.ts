import { getBanks, upsertBank } from "@/models/bank/bank.controller"
import { FastifyInstance } from "fastify"

const bank = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, getBanks)
    server.post('/', { onRequest: [server.auth] }, upsertBank)
}

export default bank