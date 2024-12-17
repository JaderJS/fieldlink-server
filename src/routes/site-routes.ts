import { login } from "@/controllers/auth-controller"
import { createOneOrMoreSiteInProperty, deleteOneSite, findOtherSites, getSiteInfo, getSites, getSitesByLocation, getEquipmentsInSite, getAllSitesInProperty, getOneSite, upsertOneOrMoreSiteInProperty } from "@/controllers/sites-controller"
import { FastifyInstance } from "fastify"

const sites = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, getSites)
    server.get('/:_id', { onRequest: [server.auth] }, getSiteInfo)
    server.get('/:_id/info', { onRequest: [server.auth] }, getSitesByLocation)
    server.post('/:_id', { onRequest: [server.auth] }, createOneOrMoreSiteInProperty)
    server.post('/property/:property_id', { onRequest: [server.auth] }, upsertOneOrMoreSiteInProperty)
    server.delete('/:site_id', { onRequest: [server.auth] }, deleteOneSite)
    server.post('/find-other-sites', { onRequest: [server.auth] }, findOtherSites)
    server.get('/:_id/equipments', { onRequest: [server.auth] }, getEquipmentsInSite)
    server.get('/property/:property_id', { onRequest: [server.auth] }, getAllSitesInProperty)
    server.get('/:site_id/property/:property_id', { onRequest: [server.auth] }, getOneSite)
}

export default sites