import { getChannelsSchema, upsertChannelAnalog, upsertChannelSchema } from "@/controllers/channel.controller"
import { getStation, getStations } from "@/controllers/station.controller"
import { FastifyInstance } from "fastify"

const property = async (server: FastifyInstance) => {
    server.get(`/stations`, { onRequest: [server.auth] }, getStations)
    server.get(`/station/:id`, { onRequest: [server.auth] }, getStation)
    server.get(`/station/:stationId/channel`, { onRequest: [server.auth] }, getChannelsSchema)
    server.post(`/station/:stationId/channel`, { onRequest: [server.auth] }, upsertChannelSchema)
    server.post(`/station/:stationId/channel/analog`, { onRequest: [server.auth] }, upsertChannelAnalog)
}

export default property