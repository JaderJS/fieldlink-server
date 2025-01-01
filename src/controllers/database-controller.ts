import { User } from '@/models/user-model'
import { FastifyRequest, FastifyReply } from 'fastify'
import { hash, compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'
import config from '../../config'
import { Bank } from '@/models/bank-model'
import { Database } from '@/models/data-base-model'
import { Types } from 'mongoose'
import { ObjectId } from 'fastify-mongodb'
import { CardDatabase } from '@/models/card-data-base-model'

const upsertDatabase = async (req: FastifyRequest, res: FastifyReply) => {
    const { _id, name, columns } = z
        .object({
            _id: z.string().cuid2(),
            name: z.string().min(3),
            columns: z.array(z.object({
                _id: z.string(),
                title: z.string().min(3),
                fields: z.array(z.object({
                    _id: z.string(),
                    type: z.string(),
                    extraAttributes: z.any().optional()
                })).transform(fields => fields.map(({ _id, ...field }) => ({ ...field, _id: _id.length <= 5 ? undefined : _id })))
            })).transform(columns => columns.map(({ _id, ...field }) => ({ ...field, _id: _id.length <= 5 ? undefined : _id }))),
        })
        .transform(({ _id, ...board }) => ({ ...board, _id: _id?.length <= 5 ? undefined : _id }))
        .parse(req.body)

    const updatedBy = req.user._id
    if (!_id) {
        await Database.create({ name, columns: columns, createdBy: updatedBy, updatedBy })
        return res.status(201).send()
    }

    await Database.findByIdAndUpdate(_id, { name, columns, updatedBy })
    return res.status(201).send()
}

const moveColumn = async (req: FastifyRequest, res: FastifyReply) => {
    const { board_id, card_id, toColumn_id } = z.object({ board_id: z.string().cuid2(), card_id: z.string().cuid2(), toColumn_id: z.string().cuid2() }).parse(req.body)

    // const session = await Database.startSession()
    // session.startTransaction()

    await Database.findOneAndUpdate(
        { _id: board_id, "columns.cards": card_id },
        { $pull: { "columns.$.cards": card_id } },
    )
    await Database.findOneAndUpdate(
        { _id: board_id, "columns._id": toColumn_id },
        { $addToSet: { "columns.$.cards": card_id } },
    )
    // await Database.findOneAndUpdate(
    //     { _id: board_id, "columns._id": column_id },
    //     { $addToSet: { "columns.$.cards": upsertCard?._id }, updatedBy },
    //     { new: true }
    // )

}

const upsertCard = async (req: FastifyRequest, res: FastifyReply) => {
    const { _id, column_id, board_id, content } = z
        .object({
            _id: z.string().cuid2(),
            column_id: z.string().cuid2(),
            board_id: z.string().cuid2(),
            content: z.record(z.unknown())
        })
        .transform(({ _id, ...card }) => ({ ...card, _id: _id?.length <= 5 ? undefined : _id }))
        .parse(req.body)

    const updatedBy = req.user._id
    const title = `${_id}-${column_id}-${board_id}`

    const board = await Database.findById(board_id)
    if (!board) {
        return res.status(404).send({ msg: "Not founded board" })
    }

    const column = board.columns.find((column) => column.id === column_id)
    if (!column) {
        return res.status(404).send({ msg: "Not founded column" })
    }

    const findCard = await CardDatabase.findById(_id)

    if (!findCard || !_id) {
        const newCard = await CardDatabase.create({
            title,
            content,
            createdBy: updatedBy,
            updatedBy,
        })
        await Database.findOneAndUpdate(
            { _id: board_id, "columns._id": column_id },
            { $addToSet: { "columns.$.cards": newCard?._id }, updatedBy },
            { new: true }
        )

        return res.status(200).send({ card: newCard })
    }

    if (!findCard && !_id) {
        return res.status(400).send({ msg: "Error to create card" })
    }

    await Database.updateOne(
        { _id: board_id },
        { $pull: { "columns.$[].cards": findCard._id }, updatedBy }
    )

    const upsertCard = await CardDatabase.findByIdAndUpdate(_id, { title, content: { ...findCard?.content, ...content }, updatedBy }, { new: true })

    await Database.findOneAndUpdate(
        { _id: board_id, "columns._id": column_id },
        { $addToSet: { "columns.$.cards": upsertCard?._id }, updatedBy },
        { new: true }
    )

    return res.status(200).send({ card: upsertCard })
}

const getDatabases = async (req: FastifyRequest, res: FastifyReply) => {
    const databases = await Database
        .find()
        .populate([
            { path: 'createdBy', select: '-password' }, { path: 'updatedBy', select: '-password' }
        ])
    return res.send({ databases })
}

const getDatabase = async (req: FastifyRequest, res: FastifyReply) => {
    const { _id } = z.object({ _id: z.string().cuid2() }).parse(req.params)
    const database = await Database.findById(_id)
        .populate(['createdBy', 'updatedBy'])
        .populate({ path: 'columns.cards', populate: ['createdBy', 'updatedBy'] })
    console.log(JSON.stringify(database, null, 2))
    if (!database) {
        return res.status(404).send({ msg: 'Not founded database' })
    }
    return res.send({ database })
}

const deleteOneDatabase = async (req: FastifyRequest, res: FastifyReply) => {
    const { _id } = z.object({ _id: z.string().cuid2() }).parse(req.params)
    await Database.findByIdAndDelete(_id)
}

const deleteOneCard = async (req: FastifyRequest, res: FastifyReply) => {
    const { _id } = z.object({ _id: z.string().cuid2() }).parse(req.params)
    // await CardDatabase.findByIdAndUpdate(_id, { isDelete: true })    
     await CardDatabase.findByIdAndDelete(_id)
    return res.status(201).send()
}

export {
    getDatabases,
    getDatabase,
    upsertDatabase,
    upsertCard,
    moveColumn,
    deleteOneDatabase,
    deleteOneCard
}