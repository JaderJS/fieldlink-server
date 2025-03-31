import { FastifyInstance } from "fastify"
import { getNotification } from "./notification.controller"

const notification = async (server: FastifyInstance) => {
    server.get('/', getNotification)
}

export default notification