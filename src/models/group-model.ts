import { model, Schema } from "mongoose"

const GroupSchema = new Schema({
    id: { type: Number, required: true },
    name: { type: String, trim: true, required: true },
    description: { type: String },
    type: {
        type: String,
        enum: ['group', 'private', 'all'],
        required: true
    },
})

export const Group = model('Group', GroupSchema)