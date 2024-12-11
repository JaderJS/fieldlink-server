import { CONSTANTS } from '@/constants'
import { Product } from '@/models/product-model'
import { Service } from '@/models/service-model'
import { User } from '@/models/user-model'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'



const getProducts = async (req: FastifyRequest, res: FastifyReply) => {
    const { _id } = z.object({ _id: z.string().cuid2().optional() }).parse(req.params)

    if (!_id) {
        const products = await Product
            .find({ $and: [{ isDelete: false }] })
            .select('-isActive -isDelete')
            .populate([
                { path: 'createdBy', select: '-password' }, { path: 'updatedBy', select: '-password' }
            ])
        const refineTags = new Set(products.flatMap((product) => product.tags).concat(CONSTANTS.tags))
        const tags = [...refineTags]
        return res.send({ products, tags })
    }
    const products = await Product
        .findById(_id)
        .select('-isActive -isDelete')
        .populate([
            { path: 'createdBy', select: '-password' }, { path: 'updatedBy', select: '-password' }
        ])
    return res.send({ products })
}

const upsertProduct = async (req: FastifyRequest, res: FastifyReply) => {
    const product = z.object({
        _id: z.string().optional(),
        name: z.string(),
        description: z.string(),
        quantity: z.coerce.number(),
        price: z.number(),
        tags: z.array(z.string()),
        thumbUrl: z.string().url(),
        unit: z.enum(['cm', 'm', 'kg', 'g', 'l', 'ml', 'unit']),
        minStock: z.coerce.number(),
        additionalImages: z.array(z.string()).optional(),
    }).parse(req.body)

    const updatedBy = { _id: req.user._id }
    if (!product._id) {
        await Product.create({ ...product, createdBy: updatedBy, updatedBy })
        return res.status(201).send()
    }

    await Product.findOneAndUpdate({ _id: product._id }, {
        ...product,
        $push: {
            history: {
                price: product.price,
                quantity: product.quantity,
                updatedBy: req.user._id,
            }
        }
    })
    return res.status(201).send()
}

const safeDeleteProduct = async (req: FastifyRequest, res: FastifyReply) => {
    const _id = z.object({ _id: z.string().optional() }).parse(req.params)
    await Product.findOneAndUpdate({ _id }, { isDelete: true })
    return res.status(204).send()
}

export { getProducts, upsertProduct, safeDeleteProduct }