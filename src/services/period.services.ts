import { db } from "@/plugins/prisma.plugins"
import { Period } from "@/../prisma/generated/client"
import { endOfMonth, format, startOfMonth } from "date-fns"

const findOrCreatePeriod = async ({ periodAt }: { periodAt: Date }): Promise<Period> => {
    let period = await db.period.findFirst({
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
        period = await db.period.create({
            data: {
                name: format(periodAt, 'MM/yyyy'), startTime: startOfMonth(periodAt), endTime: endOfMonth(periodAt)
            }
        })
    }

    return period
}

export { findOrCreatePeriod }