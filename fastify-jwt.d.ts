import "fastify"
import "@fastify/jwt"
import { PrismaClient, Role } from "@prisma/client"
import { db } from "@/plugins/prisma.plugins"

declare module "fastify" {
    interface FastifyInstance {
        auth: (
            request: FastifyRequest,
            reply: FastifyReply
        ) => Promise<void>,
        authorize: (allowedRoles: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>,
        google: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
        prisma: typeof db
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
            role: 'USER' | 'ROOT' | 'ADMIN'
            avatarUrl: string,
        }
    }
}
