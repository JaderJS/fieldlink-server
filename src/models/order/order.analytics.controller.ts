import { db } from "@/plugins/prisma.plugins"
import { FastifyReply, FastifyRequest } from "fastify"
import z from "zod"

export const getOrderAnalytics = async (req: FastifyRequest, res: FastifyReply) => {

    const { id } = z.object({ id: z.coerce.number() }).parse(req.params)

    const order = await db.order.findUniqueOrThrow({
        where: { id },
        include: {
            sales: {
                include: {
                    productsOnSale: {
                        include: { product: true }
                    }
                }
            },
            works: {
                include: {
                    sales: {
                        include: {
                            productsOnSale: {
                                include: { product: true }
                            }
                        }
                    }
                }
            }
        }
    })

    const revenue = order.total / 100

    const productsInWorksDetails = order.works.flatMap(work => (
        work.sales.flatMap(sale => (
            sale.productsOnSale.map(productOnSale => ({
                id: productOnSale.productId,
                name: productOnSale.product.name,
                price: productOnSale.price,
                cost: productOnSale.product.cost,
                quantity: productOnSale.quantity,
                totalCost: productOnSale.quantity * productOnSale.product.cost,
                totalSale: productOnSale.quantity * productOnSale.price,
            }))
        ))
    ))

    const productsInSalesDetails = order.sales.flatMap(sale => (
        sale.productsOnSale.map(productOnSale => ({
            id: productOnSale.productId,
            name: productOnSale.product.name,
            price: productOnSale.price,
            cost: productOnSale.product.cost,
            quantity: productOnSale.quantity,
            totalCost: productOnSale.quantity * productOnSale.product.cost,
            totalSale: productOnSale.quantity * productOnSale.price,
        }))
    ))

    const allProducts = [...productsInWorksDetails, ...productsInSalesDetails]

    const groupedProducts = Object.values(
        allProducts.reduce((acc, item) => {
            const existing = acc[item.id]
            if (existing) {
                existing.quantity += item.quantity
                existing.totalCost += item.totalCost
                existing.totalSale += item.totalSale
            } else {
                acc[item.id] = { ...item }
            }
            return acc
        }, {} as Record<number, typeof allProducts[number]>)
    )

    const totalCost = groupedProducts.reduce((acc, p) => acc + p.totalCost, 0)
    const totalSale = revenue
    const totalProfit = totalSale - totalCost
    const profitMargin = totalSale > 0 ? (totalProfit / totalSale) * 100 : 0

    const grossMargin = profitMargin

    const recommendations: string[] = []

    if (grossMargin < 10) {
        recommendations.push("⚠️ Margem bruta muito baixa (<10%). Reavalie o preço de venda ou reduza custos operacionais.")
    }
    else if (grossMargin < 25)
        recommendations.push("🔎 Margem bruta moderada (10–25%). Há espaço para otimizar custos ou revisar o valor percebido pelo cliente.")
    else
        recommendations.push("✅ Margem saudável. Estrutura de custos e precificação equilibradas.")

    return res.send({
        analytics: {
            products: groupedProducts.sort((a, b) => b.totalCost - a.totalCost),
            summary: {
                recommendations,
                totalCost,
                totalSale,
                totalProfit,
                profitMargin,
            },
        }
    })
}
