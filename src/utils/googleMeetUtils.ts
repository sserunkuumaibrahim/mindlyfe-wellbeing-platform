// Google Meet API utilities

// Google Meet API Configuration
export const GOOGLE_MEET_CONFIG = {
  CALENDAR_API_URL: 'https://www.googleapis.com/calendar/v3',
  OAUTH_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
  TOKEN_URL: 'https://oauth2.googleapis.com/token',
  SCOPES: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ]
}

export interface GoogleMeetEvent {
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
  }>
  conferenceData: {
    createRequest: {
      requestId: string
      conferenceSolutionKey: {
        type: 'hangoutsMeet'
      }
    }
  }
}

export interface GoogleMeetResponse {
  id: string
  htmlLink: string
  hangoutLink?: string
  conferenceData?: {
    conferenceId: string
    conferenceSolution: {
      name: string
      iconUri: string
    }
    entryPoints: Array<{
      entryPointType: string
      uri: string
      label?: string
    }>
  }
}

export const generateRequestId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export const formatGoogleDateTime = (date: Date, timeZone: string = 'UTC'): string => {
  return date.toISOString()
}

export const createGoogleMeetEvent = (
  title: string,
  description: string,
  startTime: Date,
  endTime: Date,
  attendees: Array<{ email: string; displayName?: string }> = [],
  timeZone: string = 'UTC'
): GoogleMeetEvent => {
  return {
    summary: title,
    description,
    start: {
      dateTime: formatGoogleDateTime(startTime, timeZone),
      timeZone
    },
    end: {
      dateTime: formatGoogleDateTime(endTime, timeZone),
      timeZone
    },
    attendees,
    conferenceData: {
      createRequest: {
        requestId: generateRequestId(),
        conferenceSolutionKey: {
          type: 'hangoutsMeet'
        }
      }
    }
  }
}