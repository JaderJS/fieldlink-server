import { getData } from "@/controllers/data-controller"
import { FastifyInstance } from "fastify"

const data = async (server: FastifyInstance) => {
    server.post('/', getData)
}

export default data