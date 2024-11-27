import { login } from "@/controllers/auth-controller"
import { createOneOrMoreSiteInProperty, deleteOneSite, findOtherSites, getSiteInfo, getSites, getSitesByLocation } from "@/controllers/sites-controller"
import { FastifyInstance } from "fastify"

const sites = async (server: FastifyInstance) => {
    server.get('/', getSites)
    server.get('/:_id', getSiteInfo)
    server.get('/:_id/info', getSitesByLocation)
    server.post('/:_id', createOneOrMoreSiteInProperty)
    server.delete('/:site_id', deleteOneSite)
    server.post('/find-other-sites', findOtherSites)
}

export default sites