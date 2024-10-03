import { Group } from '@/models/group-model'
import { User } from '@/models/user-model'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const createOneGroup = async (req: FastifyRequest, res: FastifyReply) => {

    try {
        const { id, name, description, type } = z.object({
            id: z.coerce.number(),
            name: z.string().min(3),
            description: z.string().nullish(),
            type: z.enum(['group', 'private', 'all'])
        }).parse(req.body)

        const group = await Group.create({ id, name, description, type })
        return res.send({ group })
    } catch (error) {
        return res.status(500).send({ msg: 'Error to create group', error })
    }
}
export {
    createOneGroup
}