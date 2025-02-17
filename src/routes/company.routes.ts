import { getCompany } from "@/controllers/company.controller"
import { FastifyInstance } from "fastify"

const company = async (server: FastifyInstance) => {
    server.get('/', getCompany)
}

export default company