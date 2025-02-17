import { Service } from '@/models/service-model'
import { User } from '@/models/user-model'
import { prisma } from '@/plugins/prisma.plugins'
import { findOrCreatePeriod } from '@/services/period.services'
import { FastifyRequest, FastifyReply } from 'fastify'
import { scheduler } from 'timers/promises'
import { z } from 'zod'

const getServicesV2 = async (req: FastifyRequest, res: FastifyReply) => {
    const services = await prisma.service.findMany({
        include: {
            transactions: {},
            client: {},
            works: {
                include: {
                    otherValues: {},
                    productsOnWork: {
                        include: {
                            product: {
                                include: {
                                    productsOnWork: { include: {} },
                                    orders: { include: {} }
                                }
                            }
                        }
                    },
                }
            }
        }
    })

    return res.send({ services })
}

const getService = async (req: FastifyRequest, res: FastifyReply) => {

    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)

    const serviceQuery = await prisma.service.findUniqueOrThrow({
        where: { id },
        include: {
            transactions: {},
            client: {},
            works: {
                include: {
                    otherValues: {},
                    productsOnWork: {
                        include: {
                            product: {
                                include: {
                                    productsOnWork: { include: {} },
                                    orders: { include: {} }
                                }
                            }
                        }
                    },
                }
            }
        }
    })

    return res.send({ service: serviceQuery })
}

const upsertService = async (req: FastifyRequest, res: FastifyReply) => {

    const { id, name, content, description, status, works, total, clientId, payment, scheduler } = z
        .object({
            id: z.number().default(0),
            clientId: z.number(),
            name: z.string().min(3),
            description: z.string().min(3).optional(),
            content: z.string(),
            status: z.enum(['STARTED', 'PENDING', 'FINISHED', 'DROPPED']).default('STARTED'),
            total: z.coerce.number(),
            scheduler: z.object({
                startTime: z.coerce.date(),
                endTime: z.coerce.date(),
            }),
            payment: z.object({
                method: z.enum(['INTEGRAL', 'INSTALLMENTS', 'OTHER']),
                bankId: z.coerce.number(),
                transactions: z.array(z.object({
                    id: z.coerce.number().default(0),
                    value: z.coerce.number(),
                    fromAt: z.coerce.date(),
                    periodId: z.coerce.number()
                })).nonempty(),
            }),
            works: z.array(z.object({
                id: z.number().default(0),
                title: z.string().min(3),
                description: z.string().optional(),
                content: z.string(),
                products: z.array(z.object({
                    id: z.coerce.number(),
                    price: z.coerce.number(),
                    quantity: z.coerce.number()
                })).optional(),
                otherValues: z.array(z.object({
                    id: z.coerce.number().default(0),
                    name: z.string(),
                    price: z.coerce.number()
                })).optional(),
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
                }).optional()
            })).nonempty(),
        }).parse(req.body)

    const service = await prisma.service.upsert({
        where: { id },
        create: {
            name,
            content,
            startTime: scheduler.startTime,
            endTime: scheduler.endTime,
            status,
            clientId,
        },
        update: {
            name,
            startTime: scheduler.startTime,
            endTime: scheduler.endTime,
            content,
            status,
            clientId,
        },
        include: { client: {} }
    })

    const titleService = ` [serviço] [${service.id}] [${service.client.name}]`
    payment.transactions.map(async ({ id, value, fromAt, periodId, ...transaction }, index) => {
        const period = await findOrCreatePeriod({ periodAt: fromAt })
        await prisma.transactions.upsert({
            where: { id },
            create: {
                title: `${index + 1}/${payment.transactions.length}` + titleService,
                type: 'INPUT',
                bankId: payment.bankId,
                companyId: 1,
                periodId: period.id,
                serviceId: service.id,
                value,
                fromAt,
                createCuid: req.user.cuid,
                updatedCuid: req.user.cuid,
            },
            update: {
                title: `${index + 1}/${payment.transactions.length}` + titleService,
                bankId: payment.bankId,
                periodId: periodId,
                serviceId: service.id,
                value,
                fromAt,
                updatedCuid: req.user.cuid,
            }
        })
    })

    await prisma.transactions.deleteMany({ where: { serviceId: service.id, id: { notIn: payment.transactions.map(({ id }) => id) } } })

    await prisma.work.deleteMany({ where: { serviceId: service.id, id: { notIn: works.map(({ id }) => id) } } })

    works.map(async (work) => {

        const workQuery = await prisma.work.upsert({
            where: { id: work.id },
            create: {
                title: work.title,
                content: work.content,
                service: { connect: { id: service.id } },
                startTime: work.schedule?.startDate ?? new Date(),
                endTime: work.schedule?.endDate ?? new Date(),
            },
            update: {
                title: work.title,
                content: work.content,
                startTime: work.schedule?.startDate ?? new Date(),
                endTime: work.schedule?.endDate ?? new Date(),
            }
        })

        await prisma.otherValues.deleteMany({ where: { works: { every: { id: work.id } }, id: { notIn: work.otherValues?.map(({ id }) => id) } } })
        work.otherValues?.map(async ({ id, name, price }) => {
            await prisma.otherValues.upsert({
                where: { id },
                create: {
                    name,
                    price,
                    works: { connect: { id: workQuery.id } }
                }, update: {
                    name,
                    price,
                }
            })
        })


        work.products?.filter(({ quantity }) => quantity > 0)?.map(async ({ id, quantity, price }) => {
            await prisma.productsOnWorks.upsert({
                where: { workId_productId: { workId: work.id, productId: id } },
                create: {
                    productId: id,
                    workId: workQuery.id,
                    quantity: quantity,
                    price,
                },
                update: {
                    quantity,
                    price,
                }
            })
        })

    })

    return res.send()
}

const deleteOneService = async (req: FastifyRequest, res: FastifyReply) => {

    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)

    await prisma.service.delete({ where: { id } })
}
export { getService, getServicesV2, upsertService, deleteOneService }