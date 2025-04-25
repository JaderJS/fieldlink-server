import { OrderStatusType, Prisma } from "@prisma/client"

type status = OrderStatusType | "BILLED"

const CATEGORIES_ORDER = {
    ...OrderStatusType,
    BILLED: "BILLED",
} satisfies Record<string, status>

export const categoriesOfOrderFn = ({ orders }: { orders: Prisma.OrderGetPayload<{ include: { transactions: true, work: true } }>[] }) => {

    const groupedOrders = new Map<status, (Prisma.OrderGetPayload<{ include: { transactions: true } }> & { isPayBeenCompleted: boolean })[]>()

    Object.values(CATEGORIES_ORDER).forEach((status) => {
        groupedOrders.set(status, [])
    })

    console.log(JSON.stringify(orders, null, 2))

    orders.filter(({ work }) => work.length === 0).map((order) => {
        const isPayBeenCompleted = order.transactions.map(({ billed }) => billed).filter(billed => billed).length !== 0
        const categoryName: status = isPayBeenCompleted ? "BILLED" : order.status
        if (!groupedOrders.has(categoryName)) {
            groupedOrders.set(categoryName, [])
        }
        groupedOrders.get(categoryName)?.push({ ...order, isPayBeenCompleted })
    })

    return Array.from(groupedOrders.entries()).map(([name, orders]) => ({ name, orders }))
}