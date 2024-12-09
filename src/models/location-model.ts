import { model, Schema } from "mongoose"

export type ILocation = {
    name: string
    location: {
        type: 'Point',
        coordinates: [number]
    }
}

export const LocationSchema = new Schema<ILocation>({
    name: { type: String, required: true },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], //[longitude,latitude] 
            required: true
        },
    }
}, { timestamps: true, versionKey: false })

LocationSchema.index({ location: '2dsphere' })

export const Location = model('Location', LocationSchema)