import { model, Schema, Types } from "mongoose"
import { IUser } from "./user-model"
import { timeStamp } from "console"

export type IProduct = {
    _id?: string
    __v: number
    name: string
    description: string
    quantity: number
    price: number
    tags: string[]
    thumbUrl: string
    unit: 'cm' | 'm' | 'kg' | 'g' | 'l' | 'ml' | 'unit'
    isActive: boolean
    isDelete: boolean
    minStock: number
    additionalImages?: string[],
    createdBy: IUser
    updatedBy: IUser
    history: IHistoryProduct
}

type IHistoryProduct = {
    price: number
    quantity: number
    updatedBy: IUser
    updatedAt: Date
}

const ProductSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    price: { type: Number, required: true },
    tags: [{ type: String, required: true }],
    unit: { type: String, enum: ['cm', 'm', 'kg', 'g', 'l', 'ml', 'unit'] },
    isActive: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false },
    minStock: { type: Number, default: 0 },
    additionalImages: [{ type: String }],
    thumbUrl: { type: String, required: true },
    history: [{
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        updatedBy: { type: Types.ObjectId, ref: 'User', required: true },
        updatedAt: { type: Date, default: Date.now, required: true }
    }],
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

export const Product = model('Product', ProductSchema)