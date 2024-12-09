import { model, Schema, Types } from "mongoose"
import { IUser } from "./user-model"
import { ILocation } from "./location-model"
import { IProduct } from "./product-model"

type IService = {
    _id?: string
    __v?: number
    createdAt: number
    updatedAt: number
    name: string
    description: string
    services: IServiceContent[]
    schedule: ISchedule
    isDeleted: boolean
    createdBy: IUser
    updatedBy: IUser
    status: 'pending' | 'in-progress' | 'completed'
}

type IServiceContent = {
    name: string
    description?: string
    materials: IProduct[]
    files: {
        pathUrl: string
        size: string
        contentType: string
    }[],
    local: ILocation
}

type ISchedule = {
    startDate: Date
    endDate: Date
    notes?: string
    reminder?: boolean
    recurrencePattern?: [number]
}

const ServiceSchema = new Schema<IService>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    services: [{
        name: { type: String, required: true },
        description: { type: String },
        materials: [{ type: Types.ObjectId, ref: 'Product', required: true }],
        files: [{
            pathUr: { type: String, required: true },
            size: { type: String, required: true },
            contentType: { type: String, required: true }
        }],
        local: {
            type: Types.ObjectId, ref: 'Location', required: true
        }
    }],
    schedule: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        reminder: { type: Boolean },
        notes: { type: String },
        recurrencePattern: [{ type: Number }]
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
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
    isDeleted: { type: Boolean }
}, { timestamps: true })

export const Service = model('Service', ServiceSchema)