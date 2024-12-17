import { associateOneEquipmentModelInSite, connectGroupPropertyInEquipment, createOneEquipment, deleteOneEquipment, getAllEquipments } from "@/controllers/equipment-controller"
import { FastifyInstance } from "fastify"

const equipment = async (server: FastifyInstance) => {
    server.get(`/search`, { onResponse: [server.auth] }, getAllEquipments)
    server.put(`/in-site`, { onResponse: [server.auth] }, associateOneEquipmentModelInSite)
    server.post(`/:equipment_id/property/:property_id`, { onResponse: [server.auth] }, connectGroupPropertyInEquipment)
    server.post(`/`, { onResponse: [server.auth] }, createOneEquipment)
    server.delete(`/:equipment_id/property/:property_id`, { onResponse: [server.auth] }, deleteOneEquipment)
}

export default equipment