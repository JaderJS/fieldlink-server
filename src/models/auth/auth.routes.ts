import { Bucket } from "@/core/aws"
import { FastifyInstance } from "fastify"
import { login } from "./auth.controller"

const auth = async (server: FastifyInstance) => {
    server.post('/login', login)
}

export default auth