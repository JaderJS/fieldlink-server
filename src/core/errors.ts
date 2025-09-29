import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library"
import { FastifyInstance } from "fastify"
import { Error } from 'mongoose'
import { ZodError } from "zod"

const errorHandler: FastifyInstance['errorHandler'] = (error, req, res) => {
    console.error(error)

    if (req.method === 'delete') {
        return res.status(204)
    }
    if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P1001') {
            return res.status(400).send({ msg: 'Please make sure your database server is running' })
        }
        if (error.code === 'P2002') {
            const target = error.meta?.target as string[] || []
            const msg = target.map(t => `o campo ${t} deve ser único`).join('\n')
            return res.status(400).send({ msg })
        }
    }
    if (error instanceof Error) {
        const msg = `[MONGOOSE] - ${error.message} `
        return res.code(500).send(msg)
    }
    // if (error instanceof ZodError) {
    //     const formattedErrors = error._zod.map(e => ({
    //         message: e.message,
    //         path: e.path.join('.'),
    //     }))
    //     const msg = `[ZOD] - Validação falhou`
    //     return res.code(400).send({ msg, errors: formattedErrors })
    // }
    return res.code(500).send({ msg: error.message })
}

export { errorHandler }