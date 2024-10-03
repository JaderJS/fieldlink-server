import { Property } from "@/models/property-models"
import property from "@/routes/property-routes"
import { FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"


const getProperties = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const properties = await Property.find()
        return res.send({ properties })
    } catch (error) {
        return res.send({ msg: 'Failed rescue properties', error })
    }
}

const getProperty = async (req: FastifyRequest, res: FastifyReply) => {

}

const createOneProperty = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const body = z
            .object({
                name: z.string().min(3),
                manager: z.string().min(3),
                sites: z.array(z.object({
                    frequency: z.object({
                        rx: z.number(),
                        tx: z.number()
                    }),
                    system: z.object({
                        analog: z.object({
                            type: z.enum(['CSQ', 'TPL', 'DPL']),
                            encoder: z.number().nullish(),
                            decoder: z.number().nullish(),
                        }).optional(),
                        digital: z.object({
                            colorCode: z.number().min(0).max(15),
                            slot: z.number().min(0).max(2)
                        }).optional()
                    })
                })).nullish()
            })
            .refine(({ sites }) => {
                return sites?.some((site) => {
                    if (site.system.analog?.type !== "CSQ") {
                        const decoder = !!site.system.analog?.decoder
                        const encoder = !!site.system.analog?.decoder
                        return (decoder || encoder)
                    }
                    return site
                })
            }, { message: "Verify your silencie and encoder/decoder" })
            .refine(({ sites }) => {
                const isDigital = sites?.some((site) => !!site.system.digital) ?? false
                const isAnalog = sites?.some((site) => !!site.system.analog) ?? false
                return !(isDigital && isAnalog)
            }, { message: "Analog or digital system chose your system" })
            .parse(req.body)

        const frequencies = body.sites?.map(({ frequency }) => ({ rx: frequency.rx, tx: frequency.tx }))
        const tolerance = 25

        const result = await Property.aggregate([
            { $unwind: '$sites' },
            {
                $match: {
                    'sites.frequency.rx': {
                        $gte: frequencies?.[0].rx ?? 0 + tolerance,
                        $gt: frequencies?.[0].tx ?? 0 - tolerance
                    }
                }
            }, {
                $group: {
                    _id: "$frequency.rx",
                    match: { $sum: 1 }
                }
            }
        ])

        console.log(result)

        // const property = await Property.create(body)
        return res.send({ result })

    } catch (error) {
        return res.send({ msg: 'Failed create property', error })
    }
}

const searchToProximityFrequency = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { rx, tx, tolerance } = z.object({
            rx: z.coerce.number().min(0).default(0),
            tx: z.coerce.number().min(0).default(0),
            tolerance: z.coerce.number().min(0).default(0)
        })
            // .refine(({ tolerance, rx, tx }) => !!tolerance && (!!rx || !!tx), { message: 'Assigned RX or TX' })
            .parse(req.query)
        const search = await Property.aggregate([
            { $unwind: '$sites' },
            {
                $match: {
                    'sites.frequency.rx': { $gte: rx - tolerance, $lte: rx + tolerance }
                }
            }
        ])
        return res.send({ properties: search })
    } catch (error) {
        return res.send({ msg: 'Error to search frequency', error })
    }
}

const updateOneProperty = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { _id } = z.object({ _id: z.string().cuid2() }).parse(req.params)
        const body = z.object({}).parse(req.body)
        const property = await Property.findOneAndUpdate({ _id }, { $set: body }, { new: true })
        return res.send({ property })
    } catch (error) {
        return res.status(500).send({ msg: 'Failed update property' })
    }
}

const deleteOneProperty = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const properties = await Property.deleteMany()
        return res.send({ msg: 'Deleted' })
    } catch (error) {
        return res.send({ msg: 'Failed delete property', error })
    }
}

export {
    getProperties,
    getProperty,
    createOneProperty,
    updateOneProperty,
    deleteOneProperty,
    searchToProximityFrequency
} 