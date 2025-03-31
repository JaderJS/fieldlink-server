import { FastifyInstance } from "fastify"
import { createOneUser, deleteOneUser, getAllUsers, getUserByCuid, getUserByToken } from "@/model/user/user.controller"
import { deleteDaily, getMyDailies, getMyDaily, upsertDaily } from "@/model/user/daily.controller"

const user = async (server: FastifyInstance) => {
    server.get(`/find-many`, getAllUsers)
    server.get(`/:cuid`, getUserByCuid)
    server.get(`/`, getUserByToken)
    server.post(`/`, createOneUser)
    server.delete(`/:cuid`, deleteOneUser)

    server.get(`/dailies`, { onRequest: [server.auth] }, getMyDailies)
    server.get(`/daily/:id`, { onRequest: [server.auth] }, getMyDaily)
    server.post(`/daily`, { onRequest: [server.auth] }, upsertDaily)
    server.delete(`/daily/:id`, { onRequest: [server.auth] }, deleteDaily)
}

export default user