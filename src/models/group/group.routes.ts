import { deleteGroup, getGroups, upsertGroup } from "@/models/group/group.controller"
import { FastifyInstance } from "fastify"

const group = async (server: FastifyInstance) => {
    server.get(`/`, { onResponse: [server.auth] }, getGroups)
    server.post(`/`, { onResponse: [server.auth] }, upsertGroup)
    server.delete(`/:id`, { onResponse: [server.auth] }, deleteGroup)
}

export default group