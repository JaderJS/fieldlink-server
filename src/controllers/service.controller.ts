import { prisma } from '@/plugins/prisma.plugins'
import { Order, Prisma } from '@prisma/client'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

const getServices = async (req: FastifyRequest, res: FastifyReply) => {

    // const whereClausureSchema = z.object({
    //     where: z.object({
    //         isActive: z.boolean().optional()

    //     })
    // }) satisfies z.Schema<Prisma.UserWhereInput>

    const services = await prisma.service.findMany({
        include: {
            transactions: {},
            client: {},
            works: {
                include: {
                    otherValues: {},
                }
            }
        }
    })

    return res.send({ services })
}

const getServiceNEW = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)
    const serviceQuery = await prisma.service.findUniqueOrThrow({
        where: { id },
        include: {
            client: {},
            transactions: {},
            works: {
                include: { order: { include: { productsOnOrder: { include: { product: {} } } } }, otherValues: {} }
            }
        }
    })
    return res.send({ service: serviceQuery })
}

const upsertServiceNEW = async (req: FastifyRequest, res: FastifyReply) => {
    const { id, name, content, status, clientId, payment, works } = z.object({
        id: z.coerce.number().default(0),
        name: z.string(),
        clientId: z.coerce.number().min(1, { message: "Por favor, selecione um cliente" }),
        content: z.string(),
        payment: z.object({
            method: z.enum(['INTEGRAL', 'INSTALLMENTS', 'OTHER']),
            total: z.coerce.number(),
            transactions: z.array(z.object({
                id: z.coerce.number().default(0),
                periodId: z.coerce.number().min(1, { message: "Por favor, selecione um período" }),
                fromAt: z.coerce.date(),
                value: z.coerce.number(),
                bankId: z.coerce.number().min(1, { message: "Por favor, selecione um banco" }),
            })).nonempty()
        }),
        works: z.array(z.object({
            id: z.coerce.number().default(0),
            title: z.string().min(3),
            description: z.string().optional(),
            content: z.string(),
            total: z.coerce.number(),
            hasOrder: z.boolean(),
            order: z.object({
                id: z.coerce.number().default(0),
                status: z.enum(['PROCESS', 'INIT', 'FINISHED']),
                productsOnOrder: z.array(z.object({
                    id: z.coerce.number(),
                    quantity: z.coerce.number(),
                    price: z.coerce.number(),
                })).optional(),
            }).optional(),
            otherValues: z.array(z.object({
                id: z.coerce.number().default(0),
                name: z.string(),
                price: z.coerce.number()
            })).optional(),
            schedule: z.object({
                startDate: z.coerce.date(),
                endDate: z.coerce.date(),
                notes: z.string().optional(),
                recurrencePattern: z.array(z.number()).length(7).optional()
            })
        })),
        status: z.enum(['STARTED', 'PENDING', 'FINISHED', 'DROPPED'])
    }).parse(req.body)

    const service = await prisma.service.upsert({
        where: { id },
        create: {
            name,
            content,
            endTime: new Date(),
            startTime: new Date(),
            status,
            clientId,
        },
        update: {
            name,
            content,
            status,
            clientId,
        },
    })

    await prisma.work.deleteMany({ where: { serviceId: service.id, id: { notIn: works.map(({ id }) => id) } } })
    works.map(async (work) => {

        const workMutation = await prisma.work.upsert({
            where: { id: work.id },
            create: {
                title: work.title,
                content: work.content,
                startTime: work.schedule.startDate,
                endTime: work.schedule.endDate,
                serviceId: service.id,
                total: work.total,
            },
            update: {
                title: work.title,
                content: work.content,
                startTime: work.schedule.startDate,
                endTime: work.schedule.endDate,
                serviceId: service.id,
                total: work.total,
            }
        })

        let orderMutation: Order | undefined = undefined
        if (work.order) {
            orderMutation = await prisma.order.upsert({
                where: { id: work.order?.id },
                create: {
                    total: work.total,
                    assignedCuid: req.user.cuid,
                    status: "INIT",
                    clientId: clientId,
                    work: { connect: { id: workMutation.id } }
                },
                update: {
                    total: work.total,
                    assignedCuid: req.user.cuid,
                    status: "INIT",
                    clientId: clientId,
                    work: { connect: { id: workMutation.id } }
                }
            })

            await prisma.productsOnOrder.deleteMany({ where: { orderId: orderMutation.id, productId: { notIn: work.order.productsOnOrder?.map(({ id }) => id) } } })
            work.order.productsOnOrder?.map(async ({ id, price, quantity }) => {
                await prisma.productsOnOrder.upsert({
                    where: { productId_orderId: { orderId: orderMutation?.id!, productId: id } },
                    create: {
                        price,
                        quantity,
                        orderId: orderMutation?.id!,
                        productId: id,
                    },
                    update: {
                        price,
                        quantity,
                    }
                })
            })
        }

        await prisma.otherValues.deleteMany({ where: { works: { some: { id: work.id } }, id: { notIn: work.otherValues?.map(({ id }) => id) } } })
        work.otherValues?.map(async ({ id, name, price }) => {
            await prisma.otherValues.upsert({
                where: { id },
                create: {
                    name,
                    price,
                    works: { connect: { id: workMutation.id } }
                },
                update: {
                    name,
                    price,
                    works: { connect: { id: workMutation.id } }
                }
            })
        })

    })

    await prisma.transactions.deleteMany({ where: { serviceId: service.id, id: { notIn: payment.transactions.map(({ id }) => id) } } })
    payment.transactions.map(async ({ id, bankId, periodId, fromAt, value }, index) => {
        const title = `${index + 1}/${payment.transactions.length} ${name} [serviço]`
        await prisma.transactions.upsert({
            where: { id },
            create: {
                title,
                type: 'INPUT',
                value: Math.abs(value),
                bankId,
                companyId: 1,
                serviceId: service.id,
                createCuid: req.user.cuid,
                updatedCuid: req.user.cuid,
                fromAt,
                periodId
            },
            update: {
                title,
                value: Math.abs(value),
                bankId,
                serviceId: service.id,
                updatedCuid: req.user.cuid,
                fromAt,
                periodId
            }
        })
    })
    return res.status(201).send()
}

const deleteOneService = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)

    await prisma.service.delete({ where: { id } })
    // await prisma.service.update({ where: { id }, data: { isActive: false } })

    return res.status(200).send()
}

export {
    getServices,
    getServiceNEW,
    upsertServiceNEW,
    deleteOneService,
}