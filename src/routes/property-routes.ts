import { createOneProperty, deleteOneProperty, getProperties, searchToProximityFrequency } from "@/controllers/property-controller"
import { FastifyInstance } from "fastify"

const property = async (server: FastifyInstance) => {
    server.get(`/find-many`, getProperties)
    // server.get(`/:cuid`, getUserByCuid)
    server.post(`/`, createOneProperty)
    server.get(`/`, searchToProximityFrequency)
    // server.put(`/:cuid`, updateOneUser)
    server.delete(`/:cuid`, deleteOneProperty)
}

export default property