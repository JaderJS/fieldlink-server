import { Document, model, Schema, Types } from "mongoose"
import { IUser } from "./user-model"

interface IClient extends Document {
    name: string
    budget: number
    documents: any
    isDelete: boolean
    createdBy: IUser
    updatedBy: IUser
}

const ClientSchema = new Schema<IClient>({
    name: { type: String, required: true },
    budget: { type: Number, default: 0 },
    documents: [{
        name: { type: String, required: true },
        files: {
            title: { type: String, required: true },
            description: { type: String, required: true },
            pathUrl: { type: String, required: true }
        },
        createdBy: { type: Types.ObjectId, ref: 'User', required: true },
        updatedBy: { type: Types.ObjectId, ref: 'User', required: true },
    }],
    isDelete: { type: Boolean, default: false },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true, versionKey: true })

export const Client = model<IClient>('Client', ClientSchema)