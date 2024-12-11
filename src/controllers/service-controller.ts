import { Service } from '@/models/service-model'
import { User } from '@/models/user-model'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const upsertService = async (req: FastifyRequest, res: FastifyReply) => {
    const service = z.object({
        _id: z.string().cuid2().optional(),
        name: z.string().min(3),
        description: z.string().min(3),
        services: z.array(z.object({
            name: z.string().min(3),
            description: z.string().optional(),
            materials: z.array(z.union([
                z.string().cuid2(), z.string()
            ])).optional(),
            files: z.array(z.object({
                pathUrl: z.string().url(),
                size: z.string().min(3),
                contentType: z.string().min(3)
            })).optional(),
            local: z.array(z.string().cuid2().optional()).optional(),
            schedule: z.object({
                startDate: z.coerce.date(),
                endDate: z.coerce.date(),
                reminder: z.boolean().default(false),
                notes: z.string().optional(),
                recurrencePattern: z.array(z.number()).length(7).optional()
            })
        })),
        status: z.enum(['pending', 'in-progress', 'completed']).default('pending')
    }).parse(req.body)

    const updatedBy = { _id: req.user._id }
    if (!service._id) {

        await Service.create({ ...service,createdBy: updatedBy, updatedBy })
    }

}

const deleteOneService = async (req: FastifyRequest, res: FastifyReply) => {

    const { _id } = z.object({ _id: z.string().cuid2() }).parse(req.params)

    await Service.findOneAndUpdate({ _id })
}
export { upsertService, deleteOneService }