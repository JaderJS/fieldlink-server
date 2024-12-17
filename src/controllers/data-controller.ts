import { User } from '@/models/user-model'
import { FastifyRequest, FastifyReply } from 'fastify'
import { hash, compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'
import config from '../../config'
import { Bank } from '@/models/bank-model'

const getData = async (req: FastifyRequest, res: FastifyReply) => {
    return res.status(501).send()
}


export {
    getData,
}