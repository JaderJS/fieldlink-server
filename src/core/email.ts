import { createTransport } from 'nodemailer'

export const emailNode = createTransport({
    service: "gmail",
    auth: {
        user: "jader.jader55@gmail.com",
        pass: ""
    }
}) 