import { login } from "@/controllers/auth-controller"
import { getSitesByLocation } from "@/controllers/location-controller"
import { FastifyInstance } from "fastify"

const locations = async (server: FastifyInstance) => {
    server.post('/get-sites', getSitesByLocation)
}

export default locations