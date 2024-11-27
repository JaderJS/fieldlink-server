import { model, Schema, Types } from "mongoose"

type ISite = {
    frequency?: {
        rx: number
        tx: number
    },
    system: any,
    coordinate: any
}
export type IProperty = {
    name: string
    manager: string
    description?: string
    sites?: ISite[]
}

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


const SiteSchema = new Schema<ISite>({
    frequency: {
        rx: { type: Number, required: true },
        tx: { type: Number, required: true },
    },
    system: {
        type: SystemSchema,
        required: true
    },
    coordinate: {
        type: Types.ObjectId,
        ref: 'Location',
        required: true
    },
})



const PropertySchema = new Schema<IProperty>({
    name: { type: String, required: true },
    manager: { type: String, required: true },
    description: { type: String },
    sites: [{
        type: SiteSchema
    }]

}, { timestamps: true })


export const Property = model('Property', PropertySchema)