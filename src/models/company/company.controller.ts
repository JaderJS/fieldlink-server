import { db } from '@/plugins/prisma.plugins'
import { FastifyRequest, FastifyReply } from 'fastify'

const getCompany = async (req: FastifyRequest, res: FastifyReply) => {
    const companyQuery = await db.company.findMany({
        include: {
            owner: true
        }
    })

    const companies = companyQuery.map((company, index) => ({ ...company, isDefault: index === 0 ? true : false }))

    return res.send({ companies: companies })
}


export { getCompany }