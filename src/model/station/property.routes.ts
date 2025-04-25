import { getChannelsSchema, upsertChannelAnalog, upsertChannelSchema } from "@/controllers/channel.controller"
import { getProperties } from "@/controllers/property.controller"
import { deleteStation, getStation, getStations, upsertStation } from "@/model/station/station.controller"
import { FastifyInstance } from "fastify"

const property = async (server: FastifyInstance) => {
    server.get(`/`, { onRequest: [server.auth] }, getProperties)
    server.get(`/stations`, { onRequest: [server.auth] }, getStations)
    server.get(`/station/:id`, { onRequest: [server.auth] }, getStation)
    server.post(`/station`, { onRequest: [server.auth] }, upsertStation)
    
    server.get(`/station/:stationId/channel`, { onRequest: [server.auth] }, getChannelsSchema)
    server.post(`/station/:stationId/channel`, { onRequest: [server.auth] }, upsertChannelSchema)
    server.post(`/station/:stationId/channel/analog`, { onRequest: [server.auth] }, upsertChannelAnalog)
    server.delete(`/station/:stationId`, { onRequest: [server.auth] }, deleteStation)
}

export default property