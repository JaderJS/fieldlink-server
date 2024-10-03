import { model, Schema } from "mongoose"

const FileSchema = new Schema({
    path: String,
    filePathUrl: String,
    size: String,
    contentType: String
})

export const File = model('File', FileSchema)