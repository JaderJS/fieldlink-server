import { model, Schema, Types } from "mongoose"

export type IProduct = {
    name: string
    description: string
    quantity: number
    pathUrl: string
}

const ProductSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    pathUrl: { type: String, required: true }
}, { timestamps: true })

export const Product = model('Product', ProductSchema)