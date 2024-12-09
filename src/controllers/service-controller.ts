import { Service } from '@/models/service-model'
import { User } from '@/models/user-model'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const createOneService = async (req: FastifyRequest, res: FastifyReply) => {

    const service = z.object({
        name: z.string().min(3),
        description: z.string().min(3),
        services: z.array(z.object({
            name: z.string().min(3),
            description: z.string().optional(),
            materials: z.array(z.union([
                z.string().cuid2(), z.string()
            ])).nonempty(),
            files: z.array(z.object({
                pathUrl: z.string().url(),
                size: z.string().min(3),
                contentType: z.string().min(3)
            })).optional(),
            local: z.array(z.string().cuid2(), z.string()),
            schedule: z.object({
                startDate: z.date(),
                endDate: z.date(),
                reminder: z.boolean().default(false),
                notes: z.string().optional(),
                recurrencePattern: z.array(z.number()).length(7).optional()
            })
        })),
        status: z.enum(['pending', 'in-progress', 'completed']).default('pending')
    }).parse(req.body)


    await Service.create({ service })

}

const deleteOneService = async (req: FastifyRequest, res: FastifyReply) => {

    const { _id } = z.object({ _id: z.string().cuid2() }).parse(req.params)

    await Service.findOneAndUpdate({ _id })
}
export { createOneService, deleteOneService }