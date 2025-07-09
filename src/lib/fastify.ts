import fastify from "fastify"
import fastifyMultipart from '@fastify/multipart'
import fastifyJwt from '@fastify/jwt'
import cors from '@fastify/cors'
import config from "../../config"
import prismaPlugin from '@/plugins/prisma.plugins'
import fastifyQs from 'fastify-qs'
import google from '@/core/google'
import auth from '@/core/auth'
import { errorHandler } from '@/core/errors'

const server = fastify()

server.register(cors, { origin: "*" })
server.register(fastifyJwt, {
    secret: config.KEY_TOKEN,
    formatUser: (user) => ({
        _id: user._id,
        cuid: user.cuid,
        avatarUrl: user.avatarUrl,
        email: user.email,
        name: user.name,
        role: user.role as 'ADMIN' | 'USER' | 'ROOT'
    })
})

server.register(auth)
server.register(google)
server.register(prismaPlugin)

server.setErrorHandler(errorHandler)

server.register(fastifyMultipart)
server.register(fastifyQs, {})

export { server }