import { User } from '@/models/user-model'
import { FastifyRequest, FastifyReply } from 'fastify'
import { hash, compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'
import config from '../../config'
import { Bank } from '@/models/bank-model'
import { prisma } from '@/plugins/prisma.plugins'

const getBanks = async (req: FastifyRequest, res: FastifyReply) => {

    const banks = (await prisma.bank.findMany()).map((bank, index) => ({ ...bank, isDefault: index === 0 ? true : false }))
    return res.send({ banks })
}

const upsertBank = async (req: FastifyRequest, res: FastifyReply) => {
    Bank
    return res.status(501).send()
}


export { getBanks, upsertBank, }