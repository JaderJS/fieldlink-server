import { createOneGroup, deleteOneGroup, getAllGroups, getGroupsByProperty } from "@/controllers/group-controller"
import { FastifyInstance } from "fastify"

const group = async (server: FastifyInstance) => {
    server.get(`/`, getAllGroups)
    server.get(`/in-property/:property_id`, getGroupsByProperty)
    server.post(`/`, createOneGroup)
    server.delete(`/:group_id/property/:property_id`, deleteOneGroup)
}

export default group