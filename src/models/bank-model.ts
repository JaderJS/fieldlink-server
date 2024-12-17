import { Document, model, Schema, Types } from "mongoose"
import { IUser } from "./user-model"

export interface IBank extends Document {
    name: string
    balance: number
    more: {
        owner: string
        ag: string
        cc: string
    }
    thumbUrl: string
    createdBy: IUser
    updatedBy: IUser
}

const BankSchema = new Schema<IBank>({
    name: { type: String, required: true, trim: true },
    balance: { type: Number, default: 0 },
    more: {
        owner: { type: String, required: true },
        ag: { type: String, required: true },
        cc: { type: String, required: true },
        pix: { type: String, required: true }
    },
    thumbUrl: { type: String, required: true },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true, versionKey: false })

export const Bank = model<IBank>('Bank', BankSchema)