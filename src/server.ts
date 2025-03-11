import fastify, { FastifyReply, FastifyRequest } from 'fastify'
import mongoose from 'mongoose'

import fastifyMultipart from '@fastify/multipart'
import fastifyJwt from '@fastify/jwt'
import cors from '@fastify/cors'

import userRoutes from '@/routes/user.routes'
import notificationRoutes from '@/routes/notification.routes'

import authRoutes from '@/routes/auth-routes'
import propertyRoutes from '@/routes/property.routes'
import equipmentRoutes from '@/routes/equipment.routes'
import globalRoutes from '@/routes/global'
import groupRoutes from '@/routes/group.routes'
import serviceRoutes from '@/routes/service.routes'
import dataRoutes from '@/routes/data-routes'

import transactionsRoutesV2 from '@/routes/transactions.routes'
import productsRoutesV2 from '@/routes/product.routes'
import periodRoutes from '@/routes/period.routes'
import companyRoutes from '@/routes/company.routes'
import clientRoutes from '@/routes/client.routes'

import archiveRoutes from '@/routes/archive.routes'

import bankRoutes from '@/routes/bank-routes'

import dashboardRoutes from '@/routes/dashboard.routes'

import databases from '@/routes/database-routes'

import config from '../config'
import auth from '@/core/auth'
import { IUserJwt } from '../types'
import { errorHandler } from './core/errors'
import prismaPlugin from './plugins/prisma.plugins'

import fastifyQs from 'fastify-qs'
import google from './core/google'

// const server = fastify({ logger: config.LOGGER })
const server = fastify()
server.register(cors, { origin: "*", credentials: true })
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
server.register(authRoutes)

server.register(userRoutes, { prefix: `/user` })
server.register(notificationRoutes, { prefix: `/notification` })

server.register(propertyRoutes, { prefix: `/property` })
server.register(groupRoutes, { prefix: `/group` })
server.register(equipmentRoutes, { prefix: `/equipment` })
server.register(serviceRoutes, { prefix: '/service' })

server.register(transactionsRoutesV2, { prefix: '/transaction' })
server.register(productsRoutesV2, { prefix: '/v2/product' })
server.register(periodRoutes, { prefix: '/period' })
server.register(companyRoutes, { prefix: '/company' })
server.register(clientRoutes, { prefix: '/client' })
server.register(dashboardRoutes, { prefix: '/dashboard' })
server.register(bankRoutes, { prefix: '/bank' })

server.register(dataRoutes, { prefix: '/data' })
server.register(databases, { prefix: '/database' })

server.register(archiveRoutes, { prefix: '/archive' })

server.register(globalRoutes)

server.get(`/`, (req, res) => {
    res.send({ msg: "Running" })
})

mongoose.connect(config.URL_MONGO).then(async (db) => {
    console.log('Connected in DB')
    server.listen({ port: config.PORT || 3333, host: '0.0.0.0' }, (error, address) => {
        if (error) {
            console.error(error)
            process.exit(1)
        }
        console.log(`Server running in ${address}`)
    })

}).catch((error) => {
    console.error(error)
})