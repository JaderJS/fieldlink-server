import fastify from "fastify"
import fastifyMultipart from '@fastify/multipart'
import fastifyJwt from '@fastify/jwt'
import cors from '@fastify/cors'
import config from "../../config"
import prismaPlugin from '@/plugins/prisma.plugins'
import fastifyQs from 'fastify-qs'
import google from '@/core/google'
import auth from '@/core/auth'
import { authPlugin } from "@/plugins/auth"
import { errorHandler } from '@/core/errors'
import { validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform } from "fastify-type-provider-zod"
import { fastifySwagger } from "@fastify/swagger"
import { fastifySwaggerUi } from "@fastify/swagger-ui"

const server = fastify().withTypeProvider<ZodTypeProvider>()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.register(fastifySwagger, {
    openapi: {
        info: {
            title: "Field link solutions",
            version: "0.0.0"
        }
    },
    transform: jsonSchemaTransform
})

server.register(fastifySwaggerUi, { routePrefix: '/docs' })

server.register(cors, {
    origin: true,
    credentials: true,
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With"
    ],
})

server.register(fastifyJwt, {
    secret: config.KEY_TOKEN,
    formatUser: (user) => ({
        cuid: user.cuid,
        avatarUrl: user.avatarUrl,
        email: user.email,
        name: user.name,
        role: user.role as 'ADMIN' | 'USER' | 'ROOT'
    })
})

server.register(authPlugin)
server.register(auth)
server.register(google)
server.register(prismaPlugin)

server.setErrorHandler(errorHandler)

server.register(fastifyMultipart)
server.register(fastifyQs, {})

export { server }