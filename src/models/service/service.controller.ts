import { db } from '@/plugins/prisma.plugins'
import { Prisma, Order } from "@/../prisma/generated/client"
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { categoriesOfServiceFn } from './service.services'

const getServices = async (req: FastifyRequest, res: FastifyReply) => {

    const servicesQuery = await db.service.findMany({
        include: {
            transactions: { include: {} },
            client: {},
            works: {
                include: {
                    otherValues: {},
                }
            }
        }
    })

    const services = categoriesOfServiceFn({ services: servicesQuery })

    return res.send({ services })
}

const getService = async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)
    const serviceQuery = await db.service.findUniqueOrThrow({
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

    const service = await db.service.upsert({
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

    await db.work.deleteMany({ where: { serviceId: service.id, id: { notIn: works.map(({ id }) => id) } } })

    for (const work of works) {
        const workMutation = await db.work.upsert({
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

        if (!work.order) continue

        const orderMutation = await db.order.upsert({
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

        await db.productsOnOrder.deleteMany({ where: { orderId: orderMutation.id, productId: { notIn: work.order.productsOnOrder?.map(({ id }) => id) } } })

        for (const { id, price, quantity } of work.order.productsOnOrder ?? []) {

            const normQuantity = Math.abs(quantity) * -1
            const normPrice = Math.abs(price)

            await db.productsOnOrder.upsert({
                where: { productId_orderId: { orderId: orderMutation.id, productId: id } },
                create: {
                    orderId: orderMutation.id,
                    productId: id,
                    price: normPrice,
                    quantity: normQuantity,
                },
                update: {
                    price: normPrice,
                    quantity: normQuantity,
                }
            })

        }

        await db.otherValues.deleteMany({ where: { works: { some: { id: work.id } }, id: { notIn: work.otherValues?.map(({ id }) => id) } } })
        work.otherValues?.map(async ({ id, name, price }) => {
            await db.otherValues.upsert({
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

    }

    await db.transactions.deleteMany({ where: { serviceId: service.id, id: { notIn: payment.transactions.map(({ id }) => id) } } })
    payment.transactions.map(async ({ id, bankId, periodId, fromAt, value }, index) => {
        const title = `${index + 1}/${payment.transactions.length} ${name} [serviço]`
        await db.transactions.upsert({
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

    await db.service.delete({ where: { id } })
    // await db.service.update({ where: { id }, data: { isActive: false } })

    return res.status(200).send()
}

export {
    getServices,
    getService,
    upsertServiceNEW,
    deleteOneService,
}