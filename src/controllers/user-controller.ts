import { User } from '@/models/user-model'
import { FastifyRequest, FastifyReply } from 'fastify'
import { hash } from 'bcrypt'
import { z } from 'zod'

const getAllUsers = async (req: FastifyRequest, res: FastifyReply) => {
    const users = await User.find()
    return res.send({ users: users })
}
const getUserByCuid = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { cuid } = z.object({ cuid: z.string().cuid2() }).parse(req.params)
        const user = await User.findById(cuid)
        return res.send({ user })
    } catch (error) {
        return res.send({ msg: 'Failed rescue user', error })
    }
}
const createOneUser = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { email, name, password, avatarUrl } = z
            .object({ email: z.string().min(3), name: z.string().min(3), password: z.string().min(3), avatarUrl: z.string().url() })
            .parse(req.body)

        const passwordHash = await hash(password, 10)

        const user = await new User({ email, name, password: passwordHash }).save()
        return res.send({ msg: "User is created", user: user })
    } catch (error) {
        return res.send({ msg: 'Failed to create user', error: error })
    }
}
const updateOneUser = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { cuid } = z.object({ cuid: z.string().cuid2() }).parse(req.params)
        const userBody = z.object({
            avatarUrl: z.string().url().nullish(),
            name: z.string().nullish()
        }).transform((data) => {
            return {
                ...Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== undefined && value !== null))
            }
        }).parse(req.body)
        const result = await User.findOneAndUpdate({ _id: cuid }, { $set: userBody }, { new: true })
        return res.send({ msg: 'Update user successful', user: result })
    } catch (error) {
        return res.send({ msg: 'Failed update user', error })
    }
}
const deleteOneUser = async (req: FastifyRequest, res: FastifyReply) => {
    const { cuid } = z.object({ cuid: z.string().cuid2() }).parse(req.params)
    const user = await User.findOneAndDelete({ _id: cuid }, { new: true })
    return res.send({ msg: 'User deleted', user })
}

export {
    getAllUsers,
    getUserByCuid,
    createOneUser,
    updateOneUser,
    deleteOneUser
}