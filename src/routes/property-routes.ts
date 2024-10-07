import { createdAndAllocatedSiteInProperty, createOneProperty, deleteOneProperty, getProperties, getPropertyById, searchToProximityFrequency } from "@/controllers/property-controller"
import { FastifyInstance } from "fastify"

const property = async (server: FastifyInstance) => {
    server.get(`/find-many`, getProperties)
    server.get(`/:_id`, getPropertyById)
    server.post(`/`, createOneProperty)
    server.get(`/`, searchToProximityFrequency)
    server.post(`/:_id`, createdAndAllocatedSiteInProperty)
    // server.put(`/:cuid`, updateOneUser)
    server.delete(`/:cuid`, deleteOneProperty)
}

export default property