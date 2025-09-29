import { FastifyBaseLogger, FastifyInstance, RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerDefault } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"

export type IUserJwt = {
    _id: string
    email: string
    name: string
    avatarUrl: string
    role: 'user'
    __v: number
    iat: number
    exp: number
}

export type FastifyTypedInstance = FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression,
    RawReplyDefaultExpression,
    FastifyBaseLogger,
    ZodTypeProvider
>