import { User } from '@/models/user-model'
import { FastifyRequest, FastifyReply } from 'fastify'
import { hash, compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'
import config from '../../config'
import { db } from '@/plugins/prisma.plugins'

const getClients = async (req: FastifyRequest, res: FastifyReply) => {
    const clientsQuery = await db.client.findMany()
    return res.send({ clients: clientsQuery })
}

const upsertClient = async (req: FastifyRequest, res: FastifyReply) => {
    return res.status(501).send()
}


export {
    getClients,
    upsertClient,
}