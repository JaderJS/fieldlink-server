import { FastifyReply, FastifyRequest } from "fastify"
import fp from "fastify-plugin"

export default fp(async function (server) {
    server.decorate("auth", async (req: FastifyRequest, res: FastifyReply) => {
        try {
            await req.jwtVerify()
        } catch (err) {
            res.code(401).send({ error: "Unauthorized" })
        }
    })
})
