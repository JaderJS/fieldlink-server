import { FastifyInstance } from "fastify"
import { login } from "./auth.controller"

const authRoutes = async (server: FastifyInstance) => {
    server.post('/login', login)
}

export default authRoutes