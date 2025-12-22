import { oauth2Client } from "@/plugins/google"
import { db } from "@/plugins/prisma.plugins"
import { FastifyReply, FastifyRequest } from "fastify"
import fp from "fastify-plugin"
import { Credentials } from "google-auth-library"


export default fp(async function (server) {
    server.decorate("google", async (req: FastifyRequest, res: FastifyReply) => {
        try {
            const dbGoogleTokens = await db.googleTokens.findFirst()

            const tokens = dbGoogleTokens?.tokens as Credentials | undefined
            if (!tokens) {
                throw new Error("Token inválido ou expirado")
            }

            oauth2Client.setCredentials(tokens)

            const accessToken = await oauth2Client.getAccessToken()
            if (!accessToken) {
                throw new Error("Token inválido ou expirado")
            }

        } catch (err) {
            return res.status(302).send({ url: 'http://localhost:3333/google' })
        }
    })
})
