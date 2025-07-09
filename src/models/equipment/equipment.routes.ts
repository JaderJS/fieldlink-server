import { deleteEquipment, getEquipments, upsertEquipment } from "@/models/equipment/equipment.controller"
import { FastifyInstance } from "fastify"

const equipment = async (server: FastifyInstance) => {
    server.get(`/`, { onResponse: [server.auth] }, getEquipments)
    server.post(`/`, { onResponse: [server.auth] }, upsertEquipment)
    server.delete(`/:id`, { onResponse: [server.auth] }, deleteEquipment)
}

export default equipment