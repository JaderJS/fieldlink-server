import { prisma } from "./prisma.plugins"
import data from '../../assets/transactions_backup.json'
import { ptBR } from 'date-fns/locale'
import { endOfMonth, format, parse, startOfMonth } from "date-fns"
import { z } from "zod"

const main = async () => {
    const company = await prisma.company.findFirst()
    if (!company)
        throw Error('No company founded')

    const bank_ = {
        "Nubank": 1,
        "Bradesco": 2,
        "Sicredi": 4,
    }

    for (const values of data) {
        try {
            const periodAt = parseDate(values.Mês.split(" ")[0])
            const fromAt = parseDate2(values.Data)
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

            const value = parseMoney(values.f_real_value)

            await prisma.transactions.create({
                data: {
                    title: values.Nome,
                    description: values.Descrição,
                    type: values.Tipo === 'Saída' ? 'OUTPUT' : 'INPUT',
                    bankId: bank_[values.Contas.split(" ")[0] as keyof typeof bank_],
                    billed: values["Faturado?"] === 'Yes' ? true : false,
                    companyId: company.id,
                    periodId: period.id,
                    fromAt,
                    value: value < 0 ? value * -1 : value,
                    createCuid: 'cm6b5mkd80000mqdzjoeic94y',
                    updatedCuid: "cm6b5mkd80000mqdzjoeic94y",
                }
            })

            await wait(1000)
            console.log("Sucesso: ", values.ID)
        } catch {

            console.error("Erro no ID: ", values.ID)
        }


    }

}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const parseDate = (dateString: string) => {
    const date = parse(`${dateString}`, 'MM/yyyy', new Date());
    return date
}

const parseDate2 = (dateString: string) => {
    const date = parse(`${dateString}`, "d 'de' MMMM 'de' yyyy", new Date(), { locale: ptBR });
    return date
}

const parseMoney = (value: string | number) => {
    if (typeof value === 'string') {
        const newValue = value.replace(',', '.')
        return z.coerce.number().parse(newValue)
    }

    return z.coerce.number().parse(value)
}

main()