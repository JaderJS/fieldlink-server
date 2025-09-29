import { FastifyInstance } from "fastify";
import { getSuppliers } from "./supplier.controller";

const supplierRoutes = async (server: FastifyInstance) => {
    server.get('/', { onRequest: [server.auth] }, getSuppliers)
}

export default supplierRoutes