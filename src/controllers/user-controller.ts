import { User } from '@/models/user-model'
import { FastifyRequest, FastifyReply } from 'fastify'
import { hash } from 'bcrypt'
import { decode, JwtPayload } from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '@/plugins/prisma.plugins'

const getAllUsers = async (req: FastifyRequest, res: FastifyReply) => {
    const users = await prisma.user.findMany()
    return res.send({ users: users })
}

const getUserByCuid = async (req: FastifyRequest, res: FastifyReply) => {
    const { cuid } = z.object({ cuid: z.string().cuid2() }).parse(req.params)
    const user = await prisma.user.findUnique({ where: { cuid } })
    return res.send({ user })
}

const getUserByToken = async (req: FastifyRequest, res: FastifyReply) => {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) {
        return res.status(400).send({ msg: 'No token send' })
    }

    const { cuid, ...payload } = decode(token) as JwtPayload & { email?: string, _id?: string }
    const user = await prisma.user.findUnique({ where: { cuid } })
    return res.send({ user })
}

const createOneUser = async (req: FastifyRequest, res: FastifyReply) => {
    const { email, name, password, avatarUrl } = z
        .object({ email: z.string().min(3), name: z.string().min(3), password: z.string().min(3), avatarUrl: z.string().url() })
        .parse(req.body)

    const passwordHash = await hash(password, 10)

    const user = await prisma.user.create({ data: { email, name, password: passwordHash, avatarUrl, nickname: name, role: 'USER' } })
    return res.send({ msg: "User is created", user: user })

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
    const user = await prisma.user.update({ where: { cuid }, data: { isEnable: false } })
    return res.send({ msg: 'User deleted', user })
}

export {
    getAllUsers,
    getUserByCuid,
    getUserByToken,
    createOneUser,
    updateOneUser,
    deleteOneUser
}