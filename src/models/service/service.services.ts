import { Prisma, ServiceType } from "@/../prisma/generated/client"


type status = "STARTED" | "PENDING" | "FINISHED" | "BILLED" | "DROPPED"

const CATEGORIES_SERVICE = {
    "STARTED": "STARTED",
    "PENDING": "PENDING",
    "FINISHED": "FINISHED",
    "BILLED": "BILLED",
    "DROPPED": "DROPPED",
} satisfies Record<string, status>

export const categoriesOfServiceFn = ({ services }: { services: Prisma.ServiceGetPayload<{ include: { transactions: true, works: { include: { otherValues: true } }, client: true } }>[] }) => {

    const groupedOrders = new Map<status, (Prisma.ServiceGetPayload<{ include: { transactions: true } }> & { isPayBeenCompleted: boolean })[]>()

    Object.values(CATEGORIES_SERVICE).forEach((status) => {
        groupedOrders.set(status, [])
    })

    services.map((service) => {
        const isPayBeenCompleted = service.transactions.map(({ billed }) => billed).filter(billed => billed).length !== 0
        const categoryName: status = isPayBeenCompleted ? "BILLED" : service.status as ServiceType
        if (!groupedOrders.has(categoryName)) {
            groupedOrders.set(categoryName, [])
        }
        groupedOrders.get(categoryName)?.push({ ...service, isPayBeenCompleted })
    })

    return Array.from(groupedOrders.entries()).map(([name, services]) => ({ name, services }))
}