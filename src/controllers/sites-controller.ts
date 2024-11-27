import { IProperty, Property } from '@/models/property-models'
import { Location } from '@/models/location-model'
import { FastifyReply, FastifyRequest } from 'fastify'
import { decode, JwtPayload } from 'jsonwebtoken'
import { Types } from 'mongoose'
import { z } from 'zod'

const getSiteInfo = async (req: FastifyRequest, res: FastifyReply) => {
    try {

        const { _id } = z.object({ _id: z.string().cuid2() }).parse(req.params)
        const { maxDistance } = z.object({ maxDistance: z.number().optional() }).parse(req.query)

        const site = await Property.aggregate<IProperty>([{ $unwind: 'sites' }, { $match: { _id: new Types.ObjectId(_id) } }])

        if (!site || site.length === 0) {
            return res.status(404).send({ msg: 'Site not founded' })
        }

        return res.send()
    } catch (error) {
        return res.status(500).send({ msg: 'Error to find info to site', error })
    }
}

const getSites = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { frequency, proximity } = z.object({ frequency: z.coerce.number().default(0), proximity: z.coerce.number().default(0) }).parse(req.query)

        const sites = await Property.aggregate([
            { $unwind: '$sites' },
            {
                $match: {
                    $or: [
                        { 'sites.frequency.rx': { $gte: frequency - proximity, $lte: frequency + proximity } },
                        { 'sites.frequency.tx': { $gte: frequency - proximity, $lte: frequency + proximity } }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'properties', // Nome da coleção de propriedades
                    localField: '_id',   // Campo de correspondência na coleção 'sites'
                    foreignField: '_id', // Campo de correspondência na coleção 'property'
                    as: 'property',      // Nome do campo que vai receber a propriedade
                },
            },
            {
                $unwind: {
                    path: '$property',
                    preserveNullAndEmptyArrays: true, // Para não excluir sites sem propriedade
                },
            },
            {
                $project: {
                    property: { _id: '$property._id', name: '$property.name' },
                    frequency: '$sites.frequency',
                },
            },
        ])


        return res.send({ sites })
    } catch (error) {
        return res.status(500).send({ msg: 'Failed to get sites', error })
    }
}

const createOneOrMoreSiteInProperty = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { _id } = z.object({ _id: z.string().cuid2() }).parse(req.params)
        const { sites } = z.object({
            sites: z.array(z.object({
                type: z.enum(['analog', 'digital']),
                frequency: z.object({
                    tx: z.coerce.number().min(0),
                    rx: z.coerce.number().min(0)
                }).nullish(),
                system: z.object({
                    analog: z.object({
                        type: z.enum(['CSQ', 'TPL', 'DPL']),
                        encoder: z.coerce.number().optional(),
                        decoder: z.coerce.number().optional(),
                        invert: z.boolean().nullish(),
                    }).optional(),
                    digital: z.object({
                        colorCode: z.coerce.number().min(0).max(15),
                        slot: z.coerce.number().min(0).max(2)
                    }).optional()
                }).nullish(),
                coordinate: z.object({
                    name: z.string().default('PTMP'),
                    location: z.object({
                        type: z.enum(['Point']).default('Point'),
                        coordinates: z.array(z.coerce.number()).length(2)
                    })
                })
            }))
        }).parse(req.body)

        const saveDB = sites.map(async (site) => {
            const location = await Location.create({ name: site.coordinate.name, location: { type: 'Point', coordinates: site.coordinate.location.coordinates } })
            const newSite = { ...site, coordinate: location._id }
            await Property.findOneAndUpdate({ _id }, { $push: { sites: { $each: [newSite] } } }, { new: true })
        })

        await Promise.all([saveDB])

        return res.status(201).send()
    } catch (error) {
        console.log(error)
        return res.status(500).send({ msg: 'Failed to link site to property' })
    }
}

const deleteOneSite = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { site_id } = z.object({ site_id: z.string().cuid2() }).parse(req.params)
        const { property_id } = z.object({ property_id: z.string().cuid2() }).parse(req.query)
        const property = await Property.findOneAndUpdate({ _id: property_id }, { $pull: { sites: { _id: site_id } } })
        if (!property) {
            return res.status(404).send({ msg: 'Site not founded' })
        }
        return res.status(204).send()
    } catch (error) {
        return res.send(500).send({ msg: "Error to drop site", error })
    }
}

const getSitesByLocation = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        console.log(req.params)
        const { _id } = z.object({ _id: z.string().cuid2() }).parse(req.params)
        // const { maxDistance } = z.object({ maxDistance: z.coerce.number() }).parse(req.query)

        return res.send()
    } catch (error) {
        console.error(error)
        return res.status(500).send({ msg: 'Failed to find sites by location' })
    }
}
const findOtherSites = async (req: FastifyRequest, res: FastifyReply) => {
    try {

        const { frequency } = z.object({ frequency: z.object({ rx: z.number(), tx: z.number(), proximity: z.number().default(0) }) }).parse(req.body)
        const { rx, tx, proximity } = frequency
        const properties = await Property.aggregate<IProperty>([
            { $unwind: '$sites' },
            {
                $match: {
                    $or: [
                        { 'sites.frequency.rx': { $gte: rx - proximity, $lte: rx + proximity } },
                        { 'sites.frequency.tx': { $gte: tx - proximity, $lte: tx + proximity } }
                    ]
                }
            }
        ])

        const filterProperties = properties.map(property => property.name).filter((value, index, self) => self.indexOf(value) === index)

        const msg = properties.length > 0 ? `A frequência já pertence a(s) seguintes propriedade ${filterProperties.join(` e `)}` : undefined
        return res.send({ properties, msg })
    } catch (error) {
        return res.status(500).send({ msg: 'Error to search other sites', error })
    }
}

export {
    getSiteInfo,
    getSites,
    createOneOrMoreSiteInProperty,
    deleteOneSite,
    getSitesByLocation,
    findOtherSites
}