import { Equipment } from '@/models/equipment-model'
import { User } from '@/models/user-model'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const getAllEquipments = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const equipments = await Equipment.find()
        return res.send({ equipments })
    } catch (error) {
        return res.status(500).send({ msg: 'Error on load all equipments' })
    }
}

const createOneEquipment = async (req: FastifyRequest, res: FastifyReply) => {

    try {
        const { id, name, description, type } = z.object({
            id: z.coerce.number(),
            name: z.string().min(3),
            description: z.string().nullish(),
            type: z.enum(['group', 'private', 'all'])
        }).parse(req.body)

        const group = await Equipment.create({ id, name, description, type })
        return res.send({ group })
    } catch (error) {
        return res.status(500).send({ msg: 'Error to create group', error })
    }
}
export {
    getAllEquipments,
    createOneEquipment
}