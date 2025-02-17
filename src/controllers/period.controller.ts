import { User } from '@/models/user-model'
import { FastifyRequest, FastifyReply } from 'fastify'
import { hash, compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'
import config from '../../config'
import { prisma } from '@/plugins/prisma.plugins'

const getAllPeriods = async (req: FastifyRequest, res: FastifyReply) => {
    const periods = await prisma.period.findMany({ orderBy: { order: 'desc' } })
    return res.send({ periods })
}


export { getAllPeriods }