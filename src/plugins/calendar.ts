import { google } from "googleapis"
import { add, } from 'date-fns'
import { oauth2Client } from "./google"

const calendar = google.calendar({
    version: 'v3',
    auth: "AIzaSyAll6FHZtw8YPTV06rQNrcP7cmkzTPglOw"
})

type CreateEvent = {
    date: Date,
    title: string,
    description?: string
}


type UpsertEvent = {
    id?: string | null
    date: Date
    title: string
    description?: string
}

const upsertEvent = async ({ id, date, title, description }: UpsertEvent) => {
    if (id) {
        try {
            const existingEvent = await calendar.events.get({
                auth: oauth2Client,
                calendarId: 'primary',
                eventId: id,
            })

            if (existingEvent.data) {
                await calendar.events.update({
                    auth: oauth2Client,
                    calendarId: 'primary',
                    eventId: id,
                    requestBody: {
                        summary: title,
                        description: description || title,
                        start: { dateTime: date.toISOString(), timeZone: 'America/Cuiaba' },
                        end: { dateTime: add(date, { hours: 24 }).toISOString(), timeZone: 'America/Cuiaba' },
                        reminders: { useDefault: true },
                    }
                })

                return { id }
            }
        } catch (error: any) {
            if (error.code !== 404) {
                throw new Error(`Erro ao buscar evento: ${error.message}`)
            }
        }
    }

    const response = await calendar.events.insert({
        calendarId: 'primary',
        auth: oauth2Client,
        requestBody: {
            summary: title,
            description: description || title,
            start: { dateTime: date.toISOString(), timeZone: 'America/Cuiaba' },
            end: { dateTime: add(date, { hours: 24 }).toISOString(), timeZone: 'America/Cuiaba' },
            reminders: { useDefault: true },
        }
    })

    if (!response.data.id) {
        throw new Error('Erro ao criar evento')
    }

    return { id: response.data.id }
}

export { upsertEvent }


const createEvent = async ({ date, title, description }: CreateEvent) => {
    const response = await calendar.events.insert({
        calendarId: 'primary',
        auth: oauth2Client,
        requestBody: {
            summary: title,
            description: description || title,
            start: {
                dateTime: date.toISOString(),
                timeZone: 'America/Cuiaba'
            },
            end: {
                dateTime: date.toISOString(),
                timeZone: 'America/Cuiaba'
            },
            reminders: {
                useDefault: true
            }
        }
    })
    if (!response.data.id) {
        throw new Error('Error created event')
    }
    return { id: response.data.id }
}

const updateEvent = async ({ id, date, description, title }: Partial<CreateEvent> & { id: string }) => {
    await calendar.events.update({
        calendarId: 'primary',
        auth: oauth2Client,
        eventId: id,
        requestBody: {
            summary: title,
            description: title || description,
            start: {
                dateTime: date?.toISOString(),
                timeZone: 'America/Cuiaba'
            },
            end: {
                dateTime: date?.toISOString(),
                timeZone: 'America/Cuiaba'
            },
            reminders: {
                useDefault: true
            }
        }
    })
}

const deleteEvent = async ({ id }: { id: string }) => {
    calendar.events.delete({
        calendarId: 'primary',
        auth: oauth2Client,
        eventId: id
    })
}

export { calendar, createEvent, deleteEvent }