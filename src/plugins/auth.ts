import fp from "fastify-plugin"
import { auth } from "@/auth"

export const authPlugin = fp(async (fastify) => {
    fastify.route({
        method: ["GET", "POST"],
        url: "/auth/*",
        async handler(request, reply) {
            try {
                // Monta a URL completa
                const url = new URL(request.url, `http://${request.headers.host}`)

                // Converte headers do Fastify → Fetch Headers
                const headers = new Headers()
                Object.entries(request.headers).forEach(([key, value]) => {
                    if (value) headers.append(key, value.toString())
                })

                // Cria uma Request compatível com Fetch API
                const req = new Request(url.toString(), {
                    method: request.method,
                    headers,
                    body: request.body ? JSON.stringify(request.body) : undefined,
                })

                // Processa via Better Auth
                const response = await auth.handler(req)

                // Encaminha a resposta pro cliente
                reply.status(response.status)
                response.headers.forEach((value, key) => reply.header(key, value))
                reply.send(response.body ? await response.text() : null)

            } catch (error) {
                fastify.log.error("Authentication Error:", error)
                reply.status(500).send({
                    error: "Internal authentication error",
                    code: "AUTH_FAILURE",
                })
            }
        },
    })
})
