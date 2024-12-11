import { FastifyInstance } from "fastify"
import { Error } from 'mongoose'
import { ZodError } from "zod"

const errorHandler: FastifyInstance['errorHandler'] = (error, req, res) => {
    console.error(error)

    if (req.method === 'delete') {
        return res.status(204)
    }
    if (error instanceof Error) {
        const msg = `[MONGOOSE] - ${error.message} `
        return res.code(500).send(msg)
    }
    if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(e => ({
            message: e.message,
            path: e.path.join('.'),
        }))
        const msg = `[ZOD] - Validação falhou`
        return res.code(400).send({ msg, errors: formattedErrors })
    }
    return res.code(500).send({ msg: error.message })
}

export { errorHandler }