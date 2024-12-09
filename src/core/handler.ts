import { FastifyRequest, FastifyReply } from 'fastify'

const withErrorHandling = (handler: Function) => {
    return async (req: FastifyRequest, res: FastifyReply) => {
        try {
            return await handler(req, res)
        } catch (error) {
            console.error('Erro ocorrido:', error) 
            return res.status(500).send({ msg: 'Erro interno do servidor', error })
        }
    }
}
