import mongoose, { model, Schema } from "mongoose"

const EquipmentSchema = new Schema({
    model: { type: String, trim: true, required: true },
    id: { type: Number, required: true },
    type: {
        type: String,
        enum: ['mobile', 'portable', 'repeater'],
        required: true
    },
    profileUrl: { type: String, required: true },
    groups: [{
        type: mongoose.Types.ObjectId,
        ref: 'Group'
    }],
    file: {
        type: mongoose.Types.ObjectId,
        ref: 'File'
    }
})

export const Equipment = model('Equipment', EquipmentSchema)