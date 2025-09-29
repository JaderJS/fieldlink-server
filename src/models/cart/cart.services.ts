import { db } from "@/plugins/prisma.plugins"

export const findOrConnectToDefault = async (id: number) => {
    const findSupplier = await db.supplier.findUnique({ where: { id } })
    if (findSupplier) {
        return findSupplier
    }
    const supplier = await db.supplier.findFirstOrThrow({ where: { name: "Desconhecido" } })
    return supplier
}