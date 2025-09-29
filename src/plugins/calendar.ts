import { Auth, google } from "googleapis"
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

const refreshTokenIfNeeded = async (oauthClient: Auth.OAuth2Client): Promise<void> => {
    if (!oauthClient.credentials.refresh_token) {
        throw new Error('No refresh token available')
    }
    try {
        const { credentials } = await oauthClient.refreshAccessToken()
        oauthClient.setCredentials(credentials)
    } catch (error) {
        console.error('Error refreshing access token:', error)
        throw new Error('Failed to refresh access token')
    }
}

const handleCalendarApiCall = async<T>(fn: () => Promise<T>, oauthClient: Auth.OAuth2Client): Promise<T> => {
    try {
        return await fn()
    } catch (error: any) {
        if (error.message.includes('No access, refresh token') ||
            error.message.includes('invalid_grant') ||
            error.code === 401) {

            console.log('Token expirado ou inválido, tentando renovar...')
            await refreshTokenIfNeeded(oauthClient)

            return await fn()
        }
        throw error
    }
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
    return handleCalendarApiCall(async () => {
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
    }, oauth2Client)
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