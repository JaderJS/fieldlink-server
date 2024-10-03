import { model, now, Schema } from "mongoose"
type IUser = {
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
})

const User = model('User', UserSchema)
export { User }