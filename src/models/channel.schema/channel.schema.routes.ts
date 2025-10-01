import { FastifyInstance } from "fastify"
import { getChannelsSchemas, getChannelSchemaById, upsertChannelSchema, deleteChannelSchema } from "./channel.schema.controller"

const channelSchemaRoutes = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, getChannelsSchemas)
    server.get('/:id', { onRequest: [server.auth] }, getChannelSchemaById)
    server.post('/', { onRequest: [server.auth] }, upsertChannelSchema)
    server.delete('/:id', { onRequest: [server.auth] }, deleteChannelSchema)
}

export default channelSchemaRoutes