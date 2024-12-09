import "@fastify/jwt"
import "fastify"

declare module "fastify" {
    interface FastifyInstance {
        auth: (
            request: FastifyRequest,
            reply: FastifyReply
        ) => Promise<void>
    }
}

declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: {
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
            _id: string,
            email: string,
            name: string,
            avatarUrl: string,
        }
    }
}
