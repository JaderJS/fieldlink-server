import { Equipment, IEquipment } from '@/models/equipment-model'
import { IFile, Property } from '@/models/property-models'
import { User } from '@/models/user-model'
import { FastifyRequest, FastifyReply } from 'fastify'
import { Types } from 'mongoose'
import { z } from 'zod'

const getAllEquipments = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const equipments = await Equipment.find<IEquipment>()
        return res.send({ equipments })
    } catch (error) {
        return res.status(500).send({ msg: 'Error on load all equipments' })
    }
}

const createOneEquipment = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { model, manufacturer, profileUrl, type } = z.object({
            model: z.string(),
            manufacturer: z.string().min(3),
            profileUrl: z.string().url().nullish(),
            type: z.enum(['mobile', 'portable', 'repeater']),
        }).parse(req.body)

        const equipment = await Equipment.create({ model, manufacturer, profileUrl, type })

        return res.send({ equipment })
    } catch (error) {
        return res.status(500).send({ msg: 'Error to create group', error })
    }
}

const connectGroupPropertyInEquipment = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { equipment_id, property_id } = z.object({ equipment_id: z.string().cuid2(), property_id: z.string().cuid2() }).parse(req.params)

    } catch (error) {
        return res.status(500).send({ msg: 'Fail to connect group to equipment', error })
    }
}


const associateOneEquipmentModelInSite = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { equipmentModel_id, equipment_id, property_id, sn, id, groups_ids } = z.object({
            equipmentModel_id: z.string().cuid2(),
            property_id: z.string().cuid2(),
            equipment_id: z.string().cuid2().nullish(),
            sn: z.string().min(3),
            id: z.coerce.number().min(0),
            groups_ids: z.array(z.string().cuid2()).nonempty(),
        }).parse(req.body)


        const property = await Property.findById(property_id)
        const objectIdsGroups = groups_ids.map((_id) => new Types.ObjectId(_id))
        console.log(objectIdsGroups)
        console.log(property?.groups)
        const groups = property?.groups?.filter((group: any) =>
            objectIdsGroups.some((id) => id.equals(group._id))
        ) ?? []
        console.log("GROUPS", groups)
        // const files: IFile[] = [{ contentType: 'image/png', filePathUrl: 'http', path: 'minio', size: '2Kb' }]
        property?.equipments?.push({ sn, id, groups, model: { _id: equipmentModel_id } })
        await property?.save()

        return res.send()
    } catch (error) {
        console.log(error)
        return res.status(500).send({ msg: 'Failed to associate model equipment in site ', error })
    }
}

const deleteOneEquipment = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        
        const { property_id, equipment_id } = z.object({ property_id: z.string().cuid2(), equipment_id: z.string().cuid2() }).parse(req.params)
        const property = await Property.findById(property_id)

        if (!property) {
            return res.status(404).send('Property not founded')
        }
        property.equipments = property?.equipments?.filter((equipment: any) => equipment._id.toString() !== equipment_id)
        await property.save()

        return res.status(201).send()
    } catch (error) {
        return res.status(500).send({ msg: 'Error to delete one equipment', error })
    }
}

export {
    getAllEquipments,
    createOneEquipment,
    associateOneEquipmentModelInSite,
    connectGroupPropertyInEquipment,
    deleteOneEquipment
}