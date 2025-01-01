import { Document, model, Query, Schema, Types } from "mongoose"
import { IUser } from "./user-model"

export interface ICard extends Document {
    title: string
    content: {
        [key: string]: any
    }
    isDelete: Boolean
    createdBy: IUser
    updatedBy: IUser
}

const CardDatabaseSchema = new Schema<ICard>({
    title: { type: String, required: true },
    content: { type: Object },
    isDelete: { type: Boolean, default: false },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { timestamps: true })

export const CardDatabase = model('CardDatabase', CardDatabaseSchema)