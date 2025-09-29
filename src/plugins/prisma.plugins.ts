import fp from 'fastify-plugin'
import { Prisma, PrismaClient } from '@prisma/client'
import { add, addMonths, startOfMonth, format } from 'date-fns'

const db = new PrismaClient({
    omit: {
        user: {
            password: true,
        }
    }
}).$extends({
    model: {
        period: {
            async findOrFallbackCurrentMonth(periodId: number) {
                const ctx = Prisma.getExtensionContext(this)
                if (typeof periodId === "number") {
                    const query = await ctx.findUnique({ where: { id: periodId } })
                    if (query) return query
                }

                const now = new Date()
                const start = startOfMonth(now)
                const startNext = startOfMonth(addMonths(start, 1))

                const existing = await ctx.findFirst({
                    where: {
                        AND: [
                            { startTime: { gte: start } },
                            { startTime: { lt: startNext } },
                        ],
                    },
                })
                if (existing) return existing

                const periodName = format(start, "MM/yyyy")

                try {
                    const created = await ctx.create({
                        data: {
                            name: periodName,
                            startTime: start,
                            endTime: startNext,
                        },
                    });
                    return created
                } catch (err: any) {
                    throw err
                }
            }
        },
        client: {
            async findOrFallback(clientId: number) {
                const context = Prisma.getExtensionContext(this)
                const client = await context.findUnique({ where: { id: clientId } })
                const promise = client || await context.upsert({
                    where: { id: clientId },
                    create: { name: "Desconhecido", property: "Desconhecido" }, update: {}
                })
                return promise
            }
        },
        company: {
            async findOrFallback(companyId: number) {
                const context = Prisma.getExtensionContext(this)
                const company = await context.findUnique({ where: { id: companyId } })
                const promise = company || await context.findFirst()
                return promise
            }
        },
        bank: {
            async findOrFallback(bankId: number) {
                const c = Prisma.getExtensionContext(this)
                const bank = await c.findUnique({ where: { id: bankId } })
                const promise = bank || await c.findFirstOrThrow()
                return promise
            }
        },
        supplier: {
            async findOrFallback(supplierId: number) {
                const context = Prisma.getExtensionContext(this)
                const client = await context.findUnique({ where: { id: supplierId } })
                const client_ = await context.findUnique({ where: { name: "Desconhecido" } })
                const promise = client || client_ || await context.upsert({
                    where: { id: supplierId },
                    create: { name: "Desconhecido" }, update: {}
                })
                return promise
            }
        },
        categoryOrder: {
            async findOrFallback(categoryId: number) {
                const c = Prisma.getExtensionContext(this)
                const categoryOrder = await c.findUnique({ where: { id: categoryId } })
                const promise = categoryOrder || await c.findFirstOrThrow()
                return promise
            }
        }
    }
})

export default fp(async (fastify) => {
    fastify.decorate('prisma', db)
})

export { db }