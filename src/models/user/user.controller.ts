import { FastifyRequest, FastifyReply } from 'fastify'
import { hash } from 'bcrypt'
import { decode, JwtPayload } from 'jsonwebtoken'
import { z } from 'zod'
import { db } from '@/plugins/prisma.plugins'

const getAllUsers = async (req: FastifyRequest, res: FastifyReply) => {
    const users = await db.user.findMany()
    return res.send({ users: users })
}

const getUserByCuid = async (req: FastifyRequest, res: FastifyReply) => {
    const { cuid } = z.object({ cuid: z.string().cuid2() }).parse(req.params)
    const user = await db.user.findUnique({ where: { id: cuid } })
    return res.send({ user })
}

const getUserByToken = async (req: FastifyRequest, res: FastifyReply) => {
    // const token = req.headers.authorization?.split(" ")[1]
    // if (!token) {
    //     return res.status(400).send({ msg: 'No token send' })
    // }

    // const { cuid, ...payload } = decode(token) as JwtPayload & { email?: string, _id?: string }
    const user = await db.user.findFirstOrThrow()
    return res.send({ user })
}

const createOneUser = async (req: FastifyRequest, res: FastifyReply) => {
    const { email, name, password, avatarUrl } = z
        .object({ email: z.string().min(3), name: z.string().min(3), password: z.string().min(3), avatarUrl: z.string().url() })
        .parse(req.body)

    const passwordHash = await hash(password, 10)

    const user = await db.user.create({ data: { email, name, password: passwordHash, avatarUrl, nickname: name, role: 'USER' } })
    return res.send({ msg: "User is created", user: user })

}

const deleteOneUser = async (req: FastifyRequest, res: FastifyReply) => {
    const { cuid } = z.object({ cuid: z.string().cuid2() }).parse(req.params)
    const user = await db.user.update({ where: { id: cuid }, data: { isEnable: false } })
    return res.send({ msg: 'User deleted', user })
}

export {
    getAllUsers,
    getUserByCuid,
    getUserByToken,
    createOneUser,
    deleteOneUser
}