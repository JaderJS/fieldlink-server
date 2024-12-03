import { model, Schema, Types } from "mongoose"



export type IProperty = {
    name: string
    manager: string
    description?: string
    sites?: ISite[]
    equipments?: IEquipment[]
    groups?: IGroup[]
}

type ISite = {
    frequency?: {
        rx: number
        tx: number
    },
    system: any,
    coordinate: any
}

type IEquipment = {
    id: number
    sn: string
    groups: IGroup[]
    files?: IFile[]
    model: {
        _id: string
    }
}

export type IFile = {
    path: string
    filePathUrl: string
    size: string
    contentType: string
}

export type IGroup = {
    id: number
    name: string
    description?: string
    type: 'group' | 'private' | 'all'
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

const FileSchema = new Schema<IFile>({
    path: { type: String, required: true },
    filePathUrl: { type: String, required: true },
    size: { type: String, required: true },
    contentType: { type: String, required: true },
}, { timestamps: true })

const GroupSchema = new Schema<IGroup>({
    id: { type: Number, required: true },
    name: { type: String, trim: true, required: true },
    description: { type: String },
    type: {
        type: String,
        enum: ['group', 'private', 'all'],
        required: true
    },
}, { timestamps: true, strict: true })

const EquipmentSchema = new Schema({
    id: { type: Number, required: true },
    sn: { type: String, required: true },
    model: { type: Types.ObjectId, ref: 'Equipment', required: true },
    groups: [{ type: GroupSchema }],
    files: [{ type: FileSchema }]
}, { timestamps: true })

const PropertySchema = new Schema<IProperty>({
    name: { type: String, required: true },
    manager: { type: String, required: true },
    description: { type: String },
    sites: [{ type: SiteSchema }],
    equipments: [{ type: EquipmentSchema }],
    groups: [{ type: GroupSchema }]
}, { timestamps: true, strict: true })


export const Property = model('Property', PropertySchema)