import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient({
    omit: {
        user: {
            password: true,            
        }
    }
})

export default fp(async (fastify) => {
    fastify.decorate('prisma', db)
})

export { db }