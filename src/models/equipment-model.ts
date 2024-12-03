import mongoose, { model, Schema } from "mongoose"

export type IEquipment = {
    _id: string
    model: string
    profileUrl: string
    manufacturer: string
    type: 'mobile' | 'portable' | 'repeater'
}

const EquipmentSchema = new Schema<IEquipment>({
    model: { type: String, trim: true, required: true, unique: true },
    profileUrl: { type: String, required: true },
    manufacturer: { type: String, required: true },
    type: {
        type: String,
        enum: ['mobile', 'portable', 'repeater'],
        required: true
    },
}, { timestamps: true, versionKey: false })



export const Equipment = model('Equipment', EquipmentSchema)