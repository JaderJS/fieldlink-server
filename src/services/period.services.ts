import { prisma } from "@/plugins/prisma.plugins"
import { Period } from "@prisma/client"
import { endOfMonth, format, startOfMonth } from "date-fns"

const findOrCreatePeriod = async ({ periodAt }: { periodAt: Date }): Promise<Period> => {
    let period = await prisma.period.findFirst({
        where: {
            startTime: {
                lte: periodAt
            },
            endTime: {
                gte: periodAt
            }
        }
    })
    if (!period) {
        period = await prisma.period.create({
            data: {
                name: format(periodAt, 'MM/yyyy'), startTime: startOfMonth(periodAt), endTime: endOfMonth(periodAt)
            }
        })
    }

    return period
}

export { findOrCreatePeriod }