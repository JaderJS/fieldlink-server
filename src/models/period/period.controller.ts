import { FastifyRequest, FastifyReply } from 'fastify'
import { db } from '@/plugins/prisma.plugins'
import { isWithinInterval } from 'date-fns'

const getAllPeriods = async (req: FastifyRequest, res: FastifyReply) => {
    const periodsQuery = await db.period.findMany({ orderBy: { order: 'desc' } })

    const now = new Date()
    const periods = periodsQuery.map((period) => ({
        ...period,
        isNow: isWithinInterval(now, { start: period.startTime, end: period.endTime })
    }))
    return res.send({ periods })
}


export { getAllPeriods }