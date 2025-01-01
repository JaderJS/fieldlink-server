import fastify, { FastifyReply, FastifyRequest } from 'fastify'
import mongoose from 'mongoose'

import fastifyMultipart from '@fastify/multipart'
import fastifyJwt from '@fastify/jwt'
import cors from '@fastify/cors'

import userRoutes from '@/routes/user-routes'
import authRoutes from '@/routes/auth-routes'
import propertyRoutes from '@/routes/property-routes'
import sitesRoutes from '@/routes/site-routes'
import equipmentRoutes from '@/routes/equipment-routes'
import locationRoutes from '@/routes/location-routes'
import globalRoutes from '@/routes/global'
import groupRoutes from '@/routes/group-routes'
import serviceRoutes from '@/routes/service-routes'
import productRoutes from '@/routes/product-routes'
import dataRoutes from '@/routes/data-routes'

import transactionsRoutes from '@/routes/transactions-routes'
import bankRoutes from '@/routes/bank-routes'

import databases from '@/routes/database-routes'

import config from '../config'
import auth from '@/core/auth'
import { IUserJwt } from '../types'
import { errorHandler } from './core/errors'

// const server = fastify({ logger: config.LOGGER })
const server = fastify({ logger: { level: '' } })
server.register(cors, { origin: "*" })
server.register(fastifyJwt, {
    secret: config.KEY_TOKEN,
    formatUser: (user) => user
})

server.register(auth)
// server.addHook("onRequest", async (req, res) => {
//     try {
//         await req.jwtVerify()
//     } catch (err) {
//         res.send(err)
//     }
// })

server.setErrorHandler(errorHandler)

server.register(fastifyMultipart)
server.register(authRoutes)
server.register(sitesRoutes, { prefix: `/site` })
server.register(userRoutes, { prefix: `/user` })
server.register(propertyRoutes, { prefix: `/property` })
server.register(locationRoutes, { prefix: `/location` })
server.register(groupRoutes, { prefix: `/group` })
server.register(equipmentRoutes, { prefix: `/equipment` })
server.register(serviceRoutes, { prefix: '/service' })
server.register(productRoutes, { prefix: '/product' })

server.register(transactionsRoutes, { prefix: '/transaction' })
server.register(bankRoutes, { prefix: '/bank' })

server.register(dataRoutes, { prefix: '/data' })

server.register(databases, { prefix: '/database' })

server.register(globalRoutes)

server.get(`/`, (req, res) => {
    res.send({ msg: "Running" })
})

mongoose.connect(config.URL_MONGO).then((db) => {
    console.log('Connected in DB')
    server.listen({ port: config.PORT || 3333, host: '0.0.0.0' }, (error, address) => {
        if (error) {
            console.error(error)
            process.exit(1)
        }
        server.log.info(`Server `)
        console.log(`Server running in ${address}`)
    })

}).catch((error) => {
    console.error(error)
})