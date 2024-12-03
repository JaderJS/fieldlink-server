import { login } from "@/controllers/auth-controller"
import { createOneOrMoreSiteInProperty, deleteOneSite, findOtherSites, getSiteInfo, getSites, getSitesByLocation, getEquipmentsInSite, getAllSitesInProperty, getOneSite, upsertOneOrMoreSiteInProperty } from "@/controllers/sites-controller"
import { FastifyInstance } from "fastify"

const sites = async (server: FastifyInstance) => {
    server.get('/', getSites)
    server.get('/:_id', getSiteInfo)
    server.get('/:_id/info', getSitesByLocation)
    server.post('/:_id', createOneOrMoreSiteInProperty)
    server.post('/property/:property_id', upsertOneOrMoreSiteInProperty)
    server.delete('/:site_id', deleteOneSite)
    server.post('/find-other-sites', findOtherSites)
    server.get('/:_id/equipments', getEquipmentsInSite)
    server.get('/property/:property_id', getAllSitesInProperty)
    server.get('/:site_id/property/:property_id', getOneSite)
}

export default sites