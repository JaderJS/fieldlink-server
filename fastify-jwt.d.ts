import "fastify"
import "@fastify/jwt"
import { PrismaClient } from "@prisma/client"

declare module "fastify" {
    interface FastifyInstance {
        auth: (
            request: FastifyRequest,
            reply: FastifyReply
        ) => Promise<void>,
        prisma: PrismaClient
    }
}

declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: {
            cuid: string
            _id: string;
            email: string;
            name: string;
            avatarUrl: string;
            role: string;
            createdAt: string;
            __v: number;
            iat: number;
            exp: number;
        }
        user: {
            cuid: string,
            _id: string,
            email: string,
            name: string,
            avatarUrl: string,
        }
    }
}
