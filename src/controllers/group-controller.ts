import { IGroup, IProperty, Property } from '@/models/property-models'
import { User } from '@/models/user-model'
import { FastifyRequest, FastifyReply } from 'fastify'
import { Types } from 'mongoose'
import { z } from 'zod'

const getAllGroups = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { property_id } = z.object({ property_id: z.string().cuid2() }).parse(req.query)
        if (!property_id) {
            const groups = Property.aggregate<IProperty>([{ $unwind: '$groups' }])
            return res.send({ groups })
        }
        const groups = await Property.aggregate<IProperty>([
            { $unwind: '$groups' },
            { $match: { _id: new Types.ObjectId(property_id) } },
            { $replaceRoot: { newRoot: '$groups' } }
        ])
        return res.send({ groups })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ msg: 'Error on load all groups' })
    }
}

const getGroupsByProperty = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { property_id } = z.object({ property_id: z.string().cuid2() }).parse(req.params)
        const property = await Property.findById<IProperty>(property_id)
        if (!property) {
            return res.status(404).send({ msg: 'Property not found' })
        }

        res.send({ groups: property.groups })
    } catch (error) {
        return res.send(500).send({ msg: 'Failed load get groups in property' })
    }
}

const createOneGroup = async (req: FastifyRequest, res: FastifyReply) => {

    try {
        const { property_id, ...group } = z
            .object({
                id: z.coerce.number(),
                name: z.string(),
                type: z.enum(['group', 'all', 'private']),
                property_id: z.string().cuid2(),
                description: z.string().optional(),
            })
            .parse(req.body)
        const property = await Property.findById(property_id)
        property?.groups?.push(group)
        await property?.save()

        return res.status(201).send()
    } catch (error) {
        return res.status(500).send({ msg: 'Error to create group', error })
    }
}

const deleteOneGroup = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        console.log(req.params)
        const { property_id, group_id } = z.object({ property_id: z.string().cuid2(), group_id: z.string().cuid2() }).parse(req.params)
        const property = await Property.findById(property_id)
        if (!property) {
            return res.status(404).send({ msg: 'Property not founded' })
        }
        property.groups = property.groups?.filter((group: any) => group._id.toString() !== group_id)
        property.save()

        return res.send()
    } catch (error) {
        return res.status(500).send({ msg: 'Fail to delete group', error })
    }
}

export {
    getAllGroups,
    createOneGroup,
    getGroupsByProperty,
    deleteOneGroup
}