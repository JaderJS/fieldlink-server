import { deleteStation, getStation, getStations, upsertStation } from "@/models/station/station.controller"
import { FastifyInstance } from "fastify"

const stationsRoutes = async (server: FastifyInstance) => {
    server.get(`/`, { onRequest: [server.auth] }, getStations)
    server.get(`/:id`, { onRequest: [server.auth] }, getStation)
    server.post(`/`, { onRequest: [server.auth] }, upsertStation)
    server.delete(`/:id`, { onRequest: [server.auth] }, deleteStation)
}

export default stationsRoutes