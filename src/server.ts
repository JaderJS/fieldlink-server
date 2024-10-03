import fastify from 'fastify'
import mongoose from 'mongoose'
import fastifyMultipart from '@fastify/multipart'

import userRoutes from '@/routes/user-routes'
import propertyRoutes from '@/routes/property-routes'
import equipmentRoutes from '@/routes/equipment-routes'
import groupRoutes from '@/routes/group-routes'

const server = fastify()

server.register(fastifyMultipart)
server.register(userRoutes, { prefix: `/user` })
server.register(propertyRoutes, { prefix: `/property` })

server.get(`/`, (req, res) => {
    res.send({ msg: "Running" })
})

mongoose.connect("mongodb://root:example@localhost:27017").then(() => {
    console.log('Connected in DB')
    server.listen({ port: 3333 }, (error, address) => {
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