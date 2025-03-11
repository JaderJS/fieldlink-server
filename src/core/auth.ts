import { Role } from "@prisma/client"
import { FastifyReply, FastifyRequest } from "fastify"
import fp from "fastify-plugin"

export default fp(async function (server) {
    server.decorate("auth", async (req: FastifyRequest, res: FastifyReply) => {
        try {
            await req.jwtVerify()
        } catch (err) {
            res.code(401).send({ error: "Unauthorized", msg: "Não autorizado" })
        }
    })
    server.decorate('authorize', (allowedRoles: string[]) => {
        return async (req: FastifyRequest, res: FastifyReply) => {
            try {
                const { role } = await server.prisma.user.findUniqueOrThrow({ where: { cuid: req.user.cuid }, select: { role: true } })
                if (!allowedRoles.includes(role)) {
                    return res.status(403).send({ msg: `Acesso negado, você precisa de permissão para acessar ${req.url}` })
                }
            } catch (error) {
                res.status(401).send({ error: "Unauthorized", msg: "Não autorizado" })
            }
        }
    })
})
