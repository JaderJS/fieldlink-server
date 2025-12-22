import { Prisma, Bank } from "@/../prisma/generated/client"


const financesBank = (banks: Prisma.BankGetPayload<{ include: { transactions: { include: { installments: true } } } }>[]) => {
    return banks.map(({ transactions, ...bank }) => {

        const inputs = transactions.filter(t => t.type === 'INPUT').flatMap(t => t.installments).filter(({ billed }) => billed).map(i => ({ ...i, value: i.value / 100 }))
        const outputs = transactions.filter(t => t.type === 'OUTPUT').flatMap(t => t.installments).filter(({ billed }) => billed).map(i => ({ ...i, value: i.value / 100 }))

        const maxIn = inputs.length > 0 ? Math.max(...inputs.map(t => t.value)) : 0
        const minIn = inputs.length > 0 ? Math.min(...inputs.map(t => t.value)) : 0
        const maxOut = outputs.length > 0 ? Math.max(...outputs.map(t => t.value)) : 0
        const minOut = outputs.length > 0 ? Math.min(...outputs.map(t => t.value)) : 0

        const totalIn = inputs.reduce((sum, t) => sum + t.value, 0)
        const totalOut = outputs.reduce((sum, t) => sum + t.value, 0)
        const balance = totalIn - totalOut

        return ({
            id: bank.id,
            name: bank.name,
            in: inputs.reduce((sum, { value }) => sum + value, 0),
            out: outputs.reduce((sum, { value }) => sum + value, 0),
            maxIn,
            minIn,
            maxOut,
            minOut,
            balance,
            transactions: transactions
        })
    })
}

export { financesBank }