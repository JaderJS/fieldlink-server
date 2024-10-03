import { FastifyInstance } from "fastify"
import { createOneUser, deleteOneUser, getAllUsers, getUserByCuid, updateOneUser } from "@/controllers/user-controller"

const user = async (server: FastifyInstance) => {
    server.get(`/find-many`, getAllUsers)
    server.get(`/:cuid`, getUserByCuid)
    server.post(`/`, createOneUser)
    server.put(`/:cuid`, updateOneUser)
    server.delete(`/:cuid`, deleteOneUser)
}

export default user