import { User } from '@/models/user-model'
import { FastifyRequest, FastifyReply } from 'fastify'
import { hash, compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'
import config from '../../config'

const login = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const { email, password } = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body)
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(404).send({ msg: 'User not founded' })
        }
        if (!compare(password, user?.password)) {
            return res.status(403).send({ msg: 'Please, verify our credentials' })
        }
        const { password: _, ...restUser } = user.toObject()
        const token = sign(restUser, config.KEY_TOKEN, { expiresIn: '30d' })
        return res.send({ user: restUser, token })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ msg: 'Erro to login user', error })
    }
}


export {
    login,
}