import { login } from "@/controllers/auth-controller"
import { Bucket } from "@/core/aws"
import { FastifyInstance } from "fastify"

const auth = async (server: FastifyInstance) => {
    server.post('/login', login)
}

export default auth