import { Types } from "mongoose"
import fs from 'fs'
import { z } from "zod";

const parseCurrency = (currency: string) => {
    return parseFloat(currency.replace('R$', '').replace(',', '.').trim())
}

const monthsInPortuguese: { [key: string]: number } = {
    janeiro: 1,
    fevereiro: 2,
    março: 3,
    abril: 4,
    maio: 5,
    junho: 6,
    julho: 7,
    agosto: 8,
    setembro: 9,
    outubro: 10,
    novembro: 11,
    dezembro: 12
}

// Função para converter a data no formato "27 de fevereiro de 2025"
const convertDate = (dateString?: string): string => {
    if (!dateString) {
        return `1999-01-01`
    }
    const [day, month, year] = dateString.split(' de ');
    console.log(day, month, year)
    const monthNumber = monthsInPortuguese[month];

    if (monthNumber) {
        // Retorna a data no formato YYYY-MM-DD
        return `${year}-${monthNumber.toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else {
        throw new Error('Mês inválido');
    }
};

const convertDate2 = (dateString?: string): string => {
    if (!dateString) {
        return `1999-01-01`
    }
    const [month, year] = dateString.split('/')
    return `${year}-${month}-01`
}

const processJsonData = (jsonData: any[]) => {
    const user = { "$oid": new Types.ObjectId('674dd45b39fa8a3f4705cce4') }

    const bank: { [key: string]: string } = {
        "Nubank": "675c8e2c8fa605702143eda5",
        "Sicredi": "675c8e5e8fa605702143eda7",
        "Bradesco": "675c8e7d8fa605702143eda9"
    }

    return jsonData.map((entry: any) => ({
        _id: { "$oid": new Types.ObjectId() },
        title: entry.Nome,
        description: entry.Descrição,
        amount: parseCurrency(entry.Valor),
        type: entry.Tipo,
        bank: { "$oid": new Types.ObjectId(bank[entry["Contas"].split(' ')[0]]) }, // Placeholder para o ID do banco (deve ser resolvido)
        createdAt: z.coerce.date().parse(convertDate(entry['Data'])), // Placeholder para o ID do usuário que criou
        updatedAt: z.coerce.date().parse(convertDate(entry['Data'])), // Placeholder para o ID do usuário que atualizou
        // service: new Types.ObjectId(), // Placeholder para o ID do serviço
        month: z.coerce.date().parse(convertDate2(entry["Mês"].split(' ')[0])),

        createdBy: user,
        updatedBy: user,
        documents: [{
            name: entry.Nome,
            description: entry.Descrição,
            file: {
                title: entry.Nome,
                pathUrl: entry.Contas
            },
            createdBy: user,
            updatedBy: user,
        }],
        markdownContent: `Detalhes: ${entry.Descrição}\nConta: ${entry.Contas}`,
        billed: entry['Faturado?'] === 'Yes' ? true : false,
        hasNfe: false,
        isDelete: false
    }));
};

const main = async () => {
    try {
        // Ler o arquivo JSON com fs
        const jsonData = JSON.parse(fs.readFileSync('./arquivo.json', 'utf-8'));
        console.log('Arquivo JSON lido com sucesso!');

        // Processar os dados para o formato necessário
        const processedData = processJsonData(jsonData);

        // Inserir os dados processados no MongoDB
        console.log(processedData[0])
        fs.writeFileSync('./data.json', JSON.stringify(processedData, null, 2))
    } catch (error) {
        console.error('Erro ao processar o arquivo:', error);
    }
}
main()