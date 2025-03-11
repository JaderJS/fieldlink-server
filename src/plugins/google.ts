import { calendar } from '@googleapis/calendar'
import { google } from 'googleapis'
import config from '../../config'
import { readFileSync } from 'node:fs'

const oauth2Client = new google.auth.OAuth2({
    clientId: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    redirectUri: "http://localhost:3333/google/redirect"
})

const scope = ["https://www.googleapis.com/auth/calendar"]

export { oauth2Client, scope }
