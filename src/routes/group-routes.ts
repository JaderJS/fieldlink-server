import { createOneGroup, deleteOneGroup, getAllGroups, getGroupsByProperty } from "@/controllers/group-controller"
import { FastifyInstance } from "fastify"

const group = async (server: FastifyInstance) => {
    server.get(`/`, { onResponse: [server.auth] }, getAllGroups)
    server.get(`/in-property/:property_id`, { onResponse: [server.auth] }, getGroupsByProperty)
    server.post(`/`, { onResponse: [server.auth] }, createOneGroup)
    server.delete(`/:group_id/property/:property_id`, { onResponse: [server.auth] }, deleteOneGroup)
}

export default group