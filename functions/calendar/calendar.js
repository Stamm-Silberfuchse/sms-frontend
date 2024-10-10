const { google } = require('googleapis')
const { JWT } = require('google-auth-library')

let credentials = require('./silberfuchsmanagementsystem-e2a4dfe1f6f4-service-account-key.json')

/*
type GEvent = {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  reminders: {
    useDefault: boolean;
    overrides: [{ method: 'popup' | 'email'; minutes: number }];
  };
  attendees: [{ email: string; comment: string }];
  sendUpdates: 'all' | 'externalOnly' | 'none';
};
*/

const getClient = () => {
  return new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: [ // set the right scope
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  })
}

exports.createGEvent = async (calendarID, gEvent) => {
  // create client that we can use to communicate with Google
  const client = getClient()
  // create a new calendar instance
  const calendar = google.calendar({ version: 'v3' })
  // make a request to Google Calendar API
  try {
    const res = await calendar.events.insert({
      calendarId: calendarID,
      auth: client,
      requestBody: gEvent,
    })
    return res.data
  } catch (error) {
    throw new Error(`Could not create event: ${error.message}`)
  }
}


exports.getGEvents = async (calendarID, props) => {
  // create client that we can use to communicate with Google
  const client = getClient()
  // create a new calendar instance
  const calendar = google.calendar({ version: 'v3' })
  // make a request to Google Calendar API.
  try {
    const res = await calendar.events.list({
      calendarId: calendarID,
      auth: client,
      singleEvents: props.singleEvents || false
    })
    return res.data
  } catch (error) {
    throw new Error(`Could not get events: ${error.message}`)
  }
}


exports.getGEvent = async (calendarID, eventID) => {
  // create client that we can use to communicate with Google
  const client = getClient()
  // create a new calendar instance
  const calendar = google.calendar({ version: 'v3' })
  // make a request to Google Calendar API.
  try {
    const res = await calendar.events.get({
      calendarId: calendarID,
      eventId: eventID,
      auth: client
    })
    return res.data
  } catch (error) {
    throw new Error(`Could not get event: ${error.message}`)
  }
}


exports.updateGEvent = async (calendarID, gEventID, gEvent) => {
  // create client that we can use to communicate with Google
  const client = getClient()
  // create a new calendar instance
  const calendar = google.calendar({ version: 'v3' })
  // make a request to Google Calendar API.
  try {
    const res = await calendar.events.update({
      calendarId: calendarID,
      eventId: gEventID,
      auth: client,
      requestBody: gEvent,
    })
    return res.data
  } catch (error) {
    throw new Error(`Could not update event: ${error.message}`)
  }
}


exports.deleteGEvent = async (calendarID, gEventID) => {
  // create client that we can use to communicate with Google
  const client = getClient()
  // create a new calendar instance
  const calendar = google.calendar({ version: 'v3' })
  // make a request to Google Calendar API.
  try {
    const res = await calendar.events.delete({
      calendarId: calendarID,
      eventId: gEventID,
      auth: client,
    })
    return res.data
  } catch (error) {
    throw new Error(`Could not delete event: ${error.message}`)
  }
}


/*
// getGEvent();

createGEvent({
  summary: 'Test Event',
  description: 'This is a test event',
  start: {
    dateTime: '2024-04-17T09:00:00+01:00',
    timeZone: 'America/Los_Angeles',
  },
  end: {
    dateTime: '2024-04-17T17:00:00+01:00',
    timeZone: 'America/Los_Angeles',
  },
  reminders: {
    useDefault: false,
    overrides: [{ method: 'popup', minutes: 10 }],
  },
  attendees: [],
  sendUpdates: 'all',
});
*/
