const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const credentials = require('./silberfuchsmanagementsystem-e2a4dfe1f6f4.json');

{
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
}

const createGEvent = async (gEvent) => {
  // create client that we can use to communicate with Google
  const client = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: [ // set the right scope
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  });

  const calendar = google.calendar({ version: 'v3' });

  // We make a request to Google Calendar API.

  try {
    const res = await calendar.events.insert({
      calendarId: '5e7cde5062074a51cefeaf5c5a41eba13bbf6964f3bfedfc27d063e9f3a3c0d2@group.calendar.google.com',
      auth: client,
      requestBody: gEvent,
    });
    console.log(res.data);
  } catch (error) {
    throw new Error(`Could not create event: ${error.message}`);
  }
};

const getGEvent = async () => {
  // create client that we can use to communicate with Google
  const client = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: [ // set the right scope
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  });

  const calendar = google.calendar({ version: 'v3' });

  // We make a request to Google Calendar API.

  try {
    const res = await calendar.events.get({
      calendarId: '5e7cde5062074a51cefeaf5c5a41eba13bbf6964f3bfedfc27d063e9f3a3c0d2@group.calendar.google.com',
      eventId: 'lp8fnqd95bejm412165mtg1o08',
      auth: client
    });
    console.log(res.data);
  } catch (error) {
    throw new Error(`Could not get event: ${error.message}`);
  }
};

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
