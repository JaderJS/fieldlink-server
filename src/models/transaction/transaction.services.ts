import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export const formatEventDescription = ({
    title, type, value, fromAt, hasNfe, files, billed
}: {
    title: string,
    type: string,
    value: number,
    fromAt: Date,
    hasNfe: boolean,
    billed: boolean,
    files: {
        name: string
        pathUrl: string
    }[]
}) => {

    const formattedValue = new Intl.NumberFormat('pt-BR', {
        style: "currency",
        currency: "BRL"
    }).format(Math.abs(value))

    const summaryFiles = files.map((file) => `
     \n📎 <a href="${file.pathUrl}">Acessar arquivo ${file.name}</a>\n
    `).join('')

    const summaryEvent = `
    <b>${title}</b>
    📅 ${format(fromAt, "PPP", { locale: ptBR })}
    💵 ${formattedValue} (${type === 'INPUT' ? 'Entrada' : 'Saída'})
    ${billed ? '✅ Faturado' : '❌ Não faturado'} 
    ${hasNfe ? '📄 Possui NFe' : '📄 Sem NFe'}
    
    ${summaryFiles}

    <i>Criado pelo sistema de gestão</i>
    `.trim()

    return summaryEvent


}