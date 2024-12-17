import { createdAndAllocatedSiteInProperty, createOneProperty, deleteOneProperty, getProperties, getPropertyById, searchToProximityFrequency } from "@/controllers/property-controller"
import { FastifyInstance } from "fastify"

const property = async (server: FastifyInstance) => {
    server.get(`/find-many`, { onRequest: [server.auth] }, getProperties)
    server.get(`/:_id`, { onRequest: [server.auth] }, getPropertyById)
    server.post(`/`, { onRequest: [server.auth] }, createOneProperty)
    server.get(`/`, { onRequest: [server.auth] }, searchToProximityFrequency)
    server.post(`/:_id`, { onRequest: [server.auth] }, createdAndAllocatedSiteInProperty)
    server.delete(`/:cuid`, { onRequest: [server.auth] }, deleteOneProperty)
}

export default property