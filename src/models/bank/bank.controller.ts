import { FastifyRequest, FastifyReply } from 'fastify'
import { db } from '@/plugins/prisma.plugins'
import { applyFilters } from '@/core/filter'
import { Prisma } from "@/../prisma/generated/client"


const getBanks = async (req: FastifyRequest, res: FastifyReply) => {
    const where = await applyFilters<Prisma.BankWhereInput>({
        appliedFiltersInput: req.query as { [key: string]: unknown },
        availableFilters: {
            id: async ({ filter }) => {
                return {
                    where: {
                        id: Number(filter)
                    },
                }
            },
            name: async ({ filter }) => ({ where: { name: String(filter) } })
        },
    })

    const banksQuery = await db.bank.findMany({
        where
    })

    const banks = banksQuery.map((bank, index) => ({ ...bank, isDefault: index === 0 ? true : false }))

    return res.send({ banks })
}

const upsertBank = async (req: FastifyRequest, res: FastifyReply) => {
    return res.status(501).send()
}


export { getBanks, upsertBank, }