import { betterAuth, cuid } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { db } from "@/plugins/prisma.plugins"
import { env } from "@/env"
import { hash, compare } from 'bcrypt'
import { resend } from "./core/email"
import { createId } from "@paralleldrive/cuid2"

export const auth = betterAuth({
    basePath: "/auth",
    trustedOrigins: ["*"],
    database: prismaAdapter(db, {
        provider: 'postgresql',
    }),
    advanced: {
        database: {
            generateId: false,
        }
    },
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            redirectURI: env.BETTER_AUTH_URI
        }
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        password: {
            hash: (password) => hash(password, 10),
            verify: ({ password, hash }) => compare(password, hash)
        },
        sendResetPassword: async ({ user, url, token }, request) => {
            await resend.emails.send({
                from: "Fieldlink <no-reply@resend.dev>",
                to: user.email,
                subject: "Redefina sua senha",
                html: `Clique no link para redefinir sua senha ${url}`
            })
        }
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            await resend.emails.send({
                from: "Fieldlink <no-reply@resend.dev>",
                to: user.email,
                subject: "Verificação de email",
                html: `Clique no link para verificar seu email ${url}`
            })
        }
    },
    account: {
        accountLinking: {
            enabled: true,
        }
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5,
        }
    },
    hooks: {
        before: async ({ request, body, use }) => {
            if (request?.url.includes('/sign-up/email')) {
                const user = body as unknown as { email: string, password: string }
                const findUser = await db.user.findUnique({ where: { email: user.email }, include: { accounts: true } })
                if (findUser && !findUser.accounts.map(account => account.providerId).includes('credential')) {

                    await db.account.create({
                        data: {
                            providerId: "credential",
                            userId: findUser.id,
                            password: await hash(user.password, 10),
                            accountId: createId()
                        }
                    })

                    await resend.emails.send({
                        from: "Fieldlink <no-reply@resend.com>",
                        subject: "Vincular conta",
                        to: findUser.email,
                        html: ``
                    })
                }
            }
            return
        }
    }
})