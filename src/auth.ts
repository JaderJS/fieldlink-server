import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { db } from "@/plugins/prisma.plugins"
import { env } from "@/env"

export const auth = betterAuth({
    trustedOrigins: ["*"],
    database: prismaAdapter(db, {
        provider: 'postgresql'
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
        // password: {
        //     hash: (password) => Bun.password.hash(password),
        //     verify: ({ password, hash }) => Bun.password.verify(password, hash)
        // }
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5,
        }
    },

})