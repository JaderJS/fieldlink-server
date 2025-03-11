import { prisma } from "./prisma.plugins"
import { ptBR } from 'date-fns/locale'
import { endOfMonth, format, parse, startOfMonth } from "date-fns"
import { z } from "zod"
import { upsertEvent } from "./calendar"
import { Transactions } from "@prisma/client"
import { Credentials } from "google-auth-library"
import { oauth2Client } from "./google"

const DEFAULT_CONTENT = '<p>Caso necessário insira aqui informações úteis</p>'

const main = async () => {

    const transactions = await prisma.transactions.findMany()

    const dbGoogleTokens = await prisma.googleTokens.findFirst()

    const tokens = dbGoogleTokens?.tokens as Credentials | undefined
    if (!tokens) {
        throw new Error("Token inválido ou expirado")
    }

    oauth2Client.setCredentials(tokens)

    const accessToken = await oauth2Client.getAccessToken()
    if (!accessToken) {
        throw new Error("Token inválido ou expirado")
    }


    for (const transaction of transactions) {

        const categoryId = !!transaction.serviceId ? 1 : (!!transaction.orderId ? 2 : (!!transaction.cartId ? 3 : 4))


        const slug = createTransactionSlug({
            title: transaction.title,
            type: transaction.type,
            content: transaction.content,
            value: transaction.value,
            billed: transaction.billed,
            fromAt: transaction.fromAt,
            hasNfe: transaction.hasNfe
        })
        const { id: eventId } = await upsertEvent({ id: transaction.eventId, date: transaction.fromAt, title: transaction.title, description: slug })

        await prisma.transactions.update({
            where: { id: transaction.id },
            data: {
                eventId: eventId,
                hasNotify: !!eventId,
                value: transaction.type === 'INPUT' ? Math.abs(transaction.value) : Math.abs(transaction.value) * -1,
            }
        })
        console.log(transaction.id, transaction.type, transaction.value)
        await wait(2200)
    }

}

const createTransactionSlug = ({ title, type, description, value, billed, fromAt, hasNfe }: Partial<Transactions>) => {
    const transactionType = type === 'INPUT' ? 'Entrada' : 'Saída'
    const billedStatus = billed ? 'Faturado' : 'Não faturado'
    const nfeStatus = hasNfe ? 'Com NFE' : 'Sem NFE'
    const formattedDate = fromAt?.toLocaleString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })

    return `
    Automação Fieldlink - Transação de ${transactionType}
    Título: ${title}
    Descrição: ${description || 'Sem descrição'}
    Valor: R$${value?.toFixed(2)}
    Status do Faturamento: ${billedStatus}
    Data e Hora: ${formattedDate}
    Status da NFE:* ${nfeStatus}
    `
}


const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

main()