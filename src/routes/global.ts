import { Bucket } from "@/core/aws"
import { FastifyInstance } from "fastify"

const global = async (server: FastifyInstance) => {
    server.post(`/`, async (req, res) => {
        try {
            const data = await req.file()
            if (!data) {
                return res.status(400).send({ msg: 'Verify you content image' })
            }
            const upload = await Bucket.uploadImage(data)
            return res.send(upload)
        } catch (error) {
            return res.status(500).send({ msg: 'Ops! You need attempt now' })
        }
    })
}

export default global