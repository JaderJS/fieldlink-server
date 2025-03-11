import { FastifyInstance } from "fastify"
import { getBanks, getHealth } from "@/controllers/dashboard.controller"

const dashboard = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, getHealth)
    server.get(`/banks`, { onRequest: [server.auth] }, getBanks)
}

export default dashboard