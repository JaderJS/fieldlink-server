import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path"
import { db } from "./prisma.plugins"
import { Installment } from "@/../prisma/generated/client"
import { text } from "stream/consumers"

//root cuid cm6b5mkd80000mqdzjoeic94y

const main = async () => {
    const transactions = await db.transactions.findMany({ include: { installments: true } })
    for (const t of transactions) {
        const total = t.installments.reduce((acc, installment) => acc + installment.value, 0)
        await db.transactions.update({ where: { id: t.id }, data: { total: total } })
        console.log(`Transaction ${t.id} updated with total value ${total}`)
        wait(1000)
    }
}

main()


const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
