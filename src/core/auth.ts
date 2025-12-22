import { auth } from "@/auth"
import { Role } from "@/../prisma/generated/client"
import { FastifyReply, FastifyRequest } from "fastify"
import fp from "fastify-plugin"
import { db } from "@/plugins/prisma.plugins"

export default fp(async function (server) {
    server.decorate("auth", async (req: FastifyRequest, res: FastifyReply) => {
        try {
            const headers = new Headers()
            for (const [key, value] of Object.entries(req.headers)) {
                if (Array.isArray(value)) {
                    value.forEach(v => headers.append(key, v))
                } else if (value) {
                    headers.append(key, value)
                }
            }
            const session = await auth.api.getSession({ headers })

            if (!session) {
                return res.code(401).send({ error: "Unauthorized", msg: "Não autorizado" })
            }

            req.user = {
                cuid: session.user.id,
                avatarUrl: session.user.image || "",
                email: session.user.email,
                name: session.user.name,
                role: "ROOT"
            }
        } catch (err) {
            return res.code(401).send({ error: "Unauthorized", msg: "Não autorizado" })
        }
    })
    server.decorate('authorize', (allowedRoles: string[]) => {
        return async (req: FastifyRequest, res: FastifyReply) => {
            try {
                const { role } = await db.user.findUniqueOrThrow({ where: { id: req.user.cuid }, select: { role: true } })
                if (!allowedRoles.includes(role)) {
                    return res.status(403).send({ msg: `Acesso negado, você precisa de permissão para acessar ${req.url}` })
                }
            } catch (error) {
                res.status(401).send({ error: "Unauthorized", msg: "Não autorizado" })
            }
        }
    })
})
