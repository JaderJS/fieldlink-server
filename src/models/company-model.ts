import { Document, model, Query, Schema, Types } from "mongoose"
import { ITransactions } from "./transaction-model"

export interface ICompany extends Document {
    name: string
    balance: number
    thumbUrl: string
    transactions: ITransactions[]
}

const CompanySchema = new Schema<ICompany>({
    name: { type: String, required: true },
    thumbUrl: { type: String, required: true },
    balance: { type: Number, default: 0 },
    transactions: [{ type: Types.ObjectId, ref: 'Transactions' }],
}, { timestamps: true })

CompanySchema.statics.findByIdAndPopulateOrThrow = async function (_id: string) {
    const query = await this
        .findById(_id)
        .populate({
            path: 'transactions',
            populate: [
                { path: 'bank', model: 'Bank', select: '-balance' },
                { path: 'createdBy', model: 'User', select: '-password -isActive' },
                { path: 'updatedBy', model: 'User', select: '-password' }
            ]
        })
    if (!query) {
        throw new Error(`Company with id ${_id} not found`)
    }
    return query
}

export const Company = model<
    ICompany,
    typeof CompanySchema & { findByIdAndPopulateOrThrow: (id: string) => Promise<ICompany> }
>('Company', CompanySchema)