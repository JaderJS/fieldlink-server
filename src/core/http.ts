export class HttpError extends Error {
    status: number
    code: string
    details?: unknown

    constructor(
        code: string,
        status = 400,
        message?: string,
        details?: unknown
    ) {
        super(message)
        this.code = code
        this.status = status,
            this.details = details
    }
}