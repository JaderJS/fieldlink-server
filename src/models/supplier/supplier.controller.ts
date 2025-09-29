import { db } from "@/plugins/prisma.plugins";
import { FastifyReply, FastifyRequest } from "fastify";

const getSuppliers = async (req: FastifyRequest, res: FastifyReply) => {
    const suppliersQuery = await db.supplier.findMany()
    return res.send({ suppliers: suppliersQuery })
}

export {
    getSuppliers
}
