import { Document, model, Schema, Types } from "mongoose"
import { IBank } from "./bank-model"
import { IUser } from "./user-model"
import { IService } from "./service-model"


export interface ITransactions extends Document {
    title: string
    description: string
    amount: number
    type: 'Entrada' | 'Saida'
    month: Date
    bank: IBank
    createdBy: IUser
    updatedBy: IUser
    service: IService
    documents: {
        name: string
        description: string
        file: {
            title: string
            pathUrl: string
        }
        createdBy: IUser
        updatedBy: IUser
    }
    markdownContent: string
    hasNfe: boolean
    billed: boolean
    isDelete: boolean
}

const TransactionsSchema = new Schema<ITransactions>({
    title: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['Entrada', 'Saida'], required: true },

    bank: { type: Types.ObjectId, ref: 'Bank', required: true },
    month: { type: Date, default: Date.now() },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User', required: true },

    service: { type: Types.ObjectId, ref: 'Service' },

    documents: [{
        name: { type: String, required: true },
        description: { type: String },
        file: {
            title: { type: String, required: true },
            pathUrl: { type: String, required: true }
        },
        createdBy: { type: Types.ObjectId, ref: 'User', required: true },
        updatedBy: { type: Types.ObjectId, ref: 'User', required: true },
    }],
    markdownContent: { type: String },
    hasNfe: { type: Boolean, default: false },
    billed: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false }
}, { timestamps: true })

export const Transactions = model<ITransactions>('Transactions', TransactionsSchema)