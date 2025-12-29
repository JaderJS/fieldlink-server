import userRoutes from '@/models/user/user.routes'
import notificationRoutes from '@/models/notification/notification.routes'
import propertyRoutes from '@/models/property/property.routes'
import equipmentRoutes from '@/models/equipment/equipment.routes'
import globalRoutes from '@/routes/global'
import groupRoutes from '@/models/group/group.routes'
import serviceRoutes from '@/models/service/service.routes'
import transactionsRoutes from '@/models/transaction/transactions.routes'
import periodRoutes from '@/models/period/period.routes'
import companyRoutes from '@/models/company/company.routes'
import clientRoutes from '@/models/client/client.routes'
import docRoutes from '@/models/doc/doc.routes'
import archiveRoutes from '@/models/archive/archive.routes'
import bankRoutes from '@/models/bank/bank.routes'
import dashboardRoutes from '@/models/dashboard/dashboard.routes'
import orderRoutes from './models/order/order.routes'
import productRoutes from './models/product/product.routes'
import cartRoutes from './models/cart/cart.routes'
import supplierRoutes from './models/supplier/supplier.routes'
import authRoutes from './models/auth/auth.routes'
import installmentRoutes from './models/installment/installment.routes'
import stationsRoutes from './models/station/property.routes'
import channelSchemaRoutes from './models/channel.schema/channel.schema.routes'

import { server } from './lib/fastify'
import config from '../config'

server.register(authRoutes)

server.register(userRoutes, { prefix: `/user` })
server.register(notificationRoutes, { prefix: `/notification` })
server.register(propertyRoutes, { prefix: `/property` })
server.register(groupRoutes, { prefix: `/groups` })
server.register(equipmentRoutes, { prefix: `/equipments` })
server.register(serviceRoutes, { prefix: '/service' })
server.register(transactionsRoutes, { prefix: '/transactions' })
server.register(installmentRoutes, { prefix: '/installments' })
server.register(periodRoutes, { prefix: '/period' })
server.register(companyRoutes, { prefix: '/company' })
server.register(clientRoutes, { prefix: '/client' })
server.register(dashboardRoutes, { prefix: '/dashboard' })
server.register(bankRoutes, { prefix: '/bank' })
server.register(archiveRoutes, { prefix: '/archive' })
server.register(docRoutes, { prefix: '/doc' })
server.register(orderRoutes, { prefix: '/order' })
server.register(productRoutes, { prefix: '/product' })
server.register(cartRoutes, { prefix: '/cart' })
server.register(supplierRoutes, { prefix: '/supplier' })
server.register(propertyRoutes, { prefix: '/properties' })
server.register(stationsRoutes, { prefix: '/stations' })
server.register(channelSchemaRoutes, { prefix: '/channels-schemas' })

server.register(globalRoutes)

server.get(`/`, (req, res) => {
    res.send({ msg: "Running" })
})

server.listen({ port: config.PORT || 3333, host: '0.0.0.0' }, (error, address) => {
    if (error) {
        console.error(error)
        process.exit(1)
    }
    console.log(`Server running in ${address}`)
})