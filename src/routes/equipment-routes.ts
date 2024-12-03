import { associateOneEquipmentModelInSite, connectGroupPropertyInEquipment, createOneEquipment, deleteOneEquipment, getAllEquipments } from "@/controllers/equipment-controller"
import { FastifyInstance } from "fastify"

const equipment = async (server: FastifyInstance) => {
    server.get(`/search`, getAllEquipments)
    server.put(`/in-site`, associateOneEquipmentModelInSite)
    server.post(`/:equipment_id/property/:property_id`, connectGroupPropertyInEquipment)
    server.post(`/`, createOneEquipment)
    server.delete(`/:equipment_id/property/:property_id`, deleteOneEquipment)
}

export default equipment