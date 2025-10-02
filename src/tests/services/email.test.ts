import { resend } from "@/core/email"
import { DebugEmail } from "@/html/debug"
import { describe, it, expect, vi } from "vitest"

describe("Resend service", () => {
    it("Send email", async () => {
        const resp = await resend.emails.send({
            from: "fieldlink@resend.dev",
            subject: "debug",
            to: "jader.jader55@gmail.com",
            react: DebugEmail({ message: "Lorem ipsum Jader" })
        })
        expect(resp.error).toBeNull()
        expect(resp.data).toBeDefined()
    })
})