import { getClients, upsertClient } from "@/controllers/client.controller"
import { getNotification } from "@/controllers/notification.controller"
import { FastifyInstance } from "fastify"

const notification = async (server: FastifyInstance) => {
    server.get('/', getNotification)
}

export default notification