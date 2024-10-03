import { model, Schema } from "mongoose"

const SystemSchema = new Schema({
    analog: {
        type: {
            type: String,
            enum: ['CSQ', 'TPL', 'DPL'],
        },
        encoder: { type: Number },
        decoder: { type: Number }
    },
    digital: {
        slot: { type: Number },
        colorCode: { type: Number }
    }
}, { _id: false })


const SiteSchema = new Schema({
    frequency: {
        rx: { type: Number, required: true },
        tx: { type: Number, required: true },
    },
    system: {
        type: SystemSchema
    },
    location: {
        type: Schema.Types.ObjectId,
        ref: 'Location',
    }
})

const PropertySchema = new Schema({
    name: { type: String, required: true },
    manager: { type: String, required: true },
    description: { type: String },
    sites: [{
        type: SiteSchema
    }]

}, { timestamps: true })



export const Property = model('Property', PropertySchema)