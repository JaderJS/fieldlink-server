import { Document, model, Query, Schema, Types } from "mongoose"
import { ITransactions } from "./transaction-model"
import { IUser } from "./user-model"
import { ICard } from "./card-data-base-model"

type FieldsType =
    | 'TextField'
    | 'TitleField'
    | 'SubtitleField'
    | "ParagraphField"
    | "NumberField"
    | 'TextAreaField'
    | 'DateField'
    | 'SelectField'
    | 'CheckboxField'

export interface IDatabase extends Document {
    name: string
    columns: IColumn[]
    content: Object
    isDelete: Boolean
    createdBy: IUser
    updatedBy: IUser
}

interface IColumn extends Document {
    title: string
    fields: IField[]
    cards: ICard[]
}
interface IField extends Document {
    type: FieldsType
    extraAttributes?: {
        [key: string]: any
    }
}

const FieldSchema = new Schema<IField>({
    type: { type: String, required: true },
    extraAttributes: { type: Object }
}, { versionKey: false })

const ColumnSchema = new Schema<IColumn>({
    title: { type: String, required: true },
    fields: [FieldSchema],
    cards: [{ type: Types.ObjectId, ref: 'CardDatabase' }]
})

const DatabaseSchema = new Schema<IDatabase>({
    name: { type: String, required: true },
    content: [{ type: Object }],
    columns: [ColumnSchema],
    isDelete: { type: Boolean, default: false },
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

export const Database = model<IDatabase>('Database', DatabaseSchema)