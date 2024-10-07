import { createOneGroup, getAllGroups } from "@/controllers/group-controller"
import { FastifyInstance } from "fastify"

const group = async (server: FastifyInstance) => {
    server.get(`/`, getAllGroups)
    server.post(`/`, createOneGroup)
}

export default group