import { prisma } from '@/plugins/prisma.plugins'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const getCompany = async (req: FastifyRequest, reply: FastifyReply) => {
    const company = (await prisma.company.findMany({ include: { owner: { omit: { password: true, role: false } } } }))
        .map((company, index) => ({ ...company, isDefault: index === 0 ? true : false }))
    return reply.send({ company })
}


export { getCompany }