import fastify from 'fastify'
import mongoose from 'mongoose'

import fastifyMultipart from '@fastify/multipart'
import cors from '@fastify/cors'

import userRoutes from '@/routes/user-routes'
import propertyRoutes from '@/routes/property-routes'
import equipmentRoutes from '@/routes/equipment-routes'
import groupRoutes from '@/routes/group-routes'
import config from '../config'

const server = fastify()

server.register(cors, { origin: "*" })

server.register(fastifyMultipart)
server.register(userRoutes, { prefix: `/user` })
server.register(propertyRoutes, { prefix: `/property` })
server.register(groupRoutes, { prefix: `/group` })

server.get(`/`, (req, res) => {
    res.send({ msg: "Running" })
})

mongoose.connect(config.URL_MONGO).then(() => {
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