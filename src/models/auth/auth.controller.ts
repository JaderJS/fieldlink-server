import { FastifyRequest, FastifyReply } from 'fastify'
import { hash, compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'
import config from '@/../../config'
import { db } from '@/plugins/prisma.plugins'

const login = async (req: FastifyRequest, res: FastifyReply) => {
    const { email, password } = z.object({ email: z.email(), password: z.string().min(3) }).parse(req.body)
    const user = await db.user.findUnique({ where: { email }, select: { id: true, email: true, nickname: true, password: true, avatarUrl: true } })
    if (!user) {
        return res.status(404).send({ msg: 'User not founded' })
    }
    if (!compare(password, user.password)) {
        return res.status(403).send({ msg: 'Please, verify our credentials' })
    }
    const token = sign(user, config.KEY_TOKEN, { expiresIn: '30d' })
    return res.send({ user, token })
}


export { login }