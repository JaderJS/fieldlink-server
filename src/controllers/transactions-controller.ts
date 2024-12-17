import { User } from '@/models/user-model'
import { FastifyRequest, FastifyReply } from 'fastify'
import { hash, compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'
import config from '../../config'
import { Company, ICompany } from '@/models/company-model'
import { ITransactions, Transactions } from '@/models/transaction-model'

const getTransaction = async (req: FastifyRequest, res: FastifyReply) => {
    const { _id } = z.object({ _id: z.string().cuid2() }).parse(req.params)
    const company = await Company.findByIdAndPopulateOrThrow(_id)

    return res.status(200).send({ company })
}

const upsertTransactions = async (req: FastifyRequest, res: FastifyReply) => {
    const { _id, ...transaction } = z.object({ _id: z.string().cuid2() }).parse(req.body)
    Transactions.create({ transaction })
    return res.status(501).send()
}


export {
    getTransaction,
    upsertTransactions,
}