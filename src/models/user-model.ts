import { model, now, Schema } from "mongoose"
export type IUser = {
    _id?: string
    isActive: boolean
    name: string
    email: string
    password: string
    createdAt: Date
    avatarUrl: string
    role: "user" | "admin" | "root"
}
const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    avatarUrl: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'root'],
        default: 'user',
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: now()
    }
}, { timestamps: true, versionKey: false })

const User = model('User', UserSchema)
export { User }