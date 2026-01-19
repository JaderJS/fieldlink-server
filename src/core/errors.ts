import { FastifyInstance } from "fastify"
import { ZodError } from "zod"
import { HttpError } from "./http"

const errorHandler: FastifyInstance['errorHandler'] = (error, req, res) => {
    console.error(error)

    if (req.method === 'delete') {
        return res.status(204)
    }
    // if (error instanceof PrismaClientKnownRequestError) {
    //     if (error.code === 'P1001') {
    //         return res.status(400).send({ msg: 'Please make sure your database server is running' })
    //     }
    //     if (error.code === 'P2002') {
    //         const target = error.meta?.target as string[] || []
    //         const msg = target.map(t => `o campo ${t} deve ser único`).join('\n')
    //         return res.status(400).send({ msg })
    //     }
    // }
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


export class FileRequiredError extends HttpError {
    constructor() {
        super("FILE_REQUIRED", 400, "Nenhum arquivo enviado")
    }
}

export class FileTooLargeError extends HttpError {
    constructor(size: number, max: number) {
        super("FILE_TOO_LARGE", 413, "Arquivo excede o tamanho máximo", { size, max })
    }
}

export class InvalidFileType extends HttpError {
    constructor(type: string, allowed: string[]) {
        super("INVALID_FILE_TYPE", 400, "Tipo de arquivo não permitido", { type, allowed })
    }
}

export class InvalidMimeTypeError extends HttpError {
    constructor(type: string, allowed: string[]) {
        super("INVALID_MIMETYPE", 415, "Tipo de arquivo não permitido", { type, allowed })
    }
}

export class InvalidUploadError extends HttpError {
    constructor() {
        super("INVALID_UPLOAD", 400, "Nenhum arquivo foi criado")
    }
}

export { errorHandler }