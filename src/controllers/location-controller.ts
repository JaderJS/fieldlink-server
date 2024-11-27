import { Group } from '@/models/group-model'
import { Location } from '@/models/location-model'
import { Property } from '@/models/property-models'
import { User } from '@/models/user-model'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const getSitesByLocation = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { longitude, latitude, maxDistance } = z
            .object({ longitude: z.coerce.number(), latitude: z.coerce.number(), maxDistance: z.coerce.number().default(30000) })
            .parse(req.body)

        const coordinates = [longitude, latitude]
        const locations = await Location.find({
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates },
                    $maxDistance: maxDistance
                }
            }
        })


        const locations_ids = locations.map((loc) => loc._id)
        console.log(locations_ids)

        const properties = await Property.aggregate([
            { $unwind: '$sites' },
            { $match: { 'sites.coordinate': { $in: locations_ids } } },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    manager: { $first: "$manager" },
                    description: { $first: "$description" },
                    sites: { $push: "$sites" },
                },
            },
        ])

        const msg = `As seguintes propriedades ${properties.map(property => property.name).join(` `)} estão a uma distancia de  ${maxDistance/1E3} Km`

        return res.send({ properties, msg })
    } catch (error) {
        return res.status(500).send({ msg: 'Error to find locations', error })
    }
}

export { getSitesByLocation }