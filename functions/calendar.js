const { onCall, HttpsError } = require("firebase-functions/v2/https")
const { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } = require("firebase-functions/v2/firestore")
const { getFirestore } = require("firebase-admin/firestore")

const { createGEvent, deleteGEvent, getGEvents, getGEvent, updateGEvent } = require("./calendar/calendar")
const { logger } = require("firebase-functions/v1")

const { toZonedTime } = require('date-fns-tz')

const calendars = {
  'public': process.env.PUBLIC_CALENDAR,
  'internal': process.env.INTERNAL_CALENDAR
}

exports.getEvents = onCall(
  {
    cors: true,
    region: "europe-west3"
  },
  async (request) => {
    if (request.data?.calendarID == null) { throw new HttpsError('no-calendarID', 'Bitte gib eine Kalender-ID an.') }
    const calendarID = request.data?.calendarID
    const events = await getGEvents(calendarID, { singleEvents: true })
    return events
  }
)

exports.getEvent = onCall(
  {
    cors: true,
    region: "europe-west3"
  },
  async (request) => {
    if (request.data?.calendarID == null) { throw new HttpsError('no-calendarID', 'Bitte gib eine Kalender-ID an.') }
    if (request.data?.eventID == null) { throw new HttpsError('no-eventID', 'Bitte gib eine Event-ID an.') }
    const calendarID = request.data?.calendarID
    const eventID = request.data?.eventID
    const events = await getGEvent(calendarID, eventID)
    return events
  }
)

exports.onCreateEvent = onDocumentCreated({ document: "/events/{docID}", region: "europe-west3", database: "(default)" }, async (event) => {
  const docID = event.params.docID
  const doc = event.data.data()
  const newCalID = calendars[doc.type?.value]
  // -----------------
  let start = null
  let end = null
  if (doc.allDay) {
    start = { date: doc.start?.toDate()?.toISOString().split('T')[0] }
    end = { date: doc.end?.toDate()?.toISOString().split('T')[0] }
  } else {
    start = { dateTime: doc.start?.toDate(), timeZone: 'Europe/Berlin' }
    end = { dateTime: doc.end?.toDate(), timeZone: 'Europe/Berlin' }
  }
  const gEvent = {
    summary: doc.title,
    description: doc.description,
    location: doc.location,
    start: start,
    end: end,
    source: doc.source
  }
  // -----------------

  const db = getFirestore()
  if (doc.showInCalendar) {
    const resEvent = await createGEvent(newCalID, gEvent)
    const docRef = db.collection('events').doc(docID)
    await docRef.update({
      gEventID: resEvent.id
    })
    logger.log(`Event created: ${resEvent.id}`)
    return
  }
  if (!doc.showInCalendar) {
    logger.log(`New event shall not be shown in calendar: ${docID}`)
    return
  }
})

exports.onUpdateEvent = onDocumentUpdated({ document: "/events/{docID}", region: "europe-west3", database: "(default)" }, async (event) => {
  const docID = event.params.docID
  const beforeDoc = event.data.before.data()
  const afterDoc = event.data.after.data()
  const calID = calendars[afterDoc.type?.value]

  // -----------------
  let start = null
  let end = null
  if (afterDoc.allDay) {
    start = { date: afterDoc.start?.toDate()?.toISOString().split('T')[0] }
    end = { date: afterDoc.end?.toDate()?.toISOString().split('T')[0] }
  } else {
    start = { dateTime: afterDoc.start?.toDate(), timeZone: 'Europe/Berlin' }
    end = { dateTime: afterDoc.end?.toDate(), timeZone: 'Europe/Berlin' }
  }
  const gEvent = {
    summary: afterDoc.title,
    description: afterDoc.description,
    location: afterDoc.location,
    start: start,
    end: end,
    source: afterDoc.source
  }
  // -----------------

  const db = getFirestore()
  if (beforeDoc.showInCalendar && afterDoc.showInCalendar) {
    await updateGEvent(calID, afterDoc.gEventID, gEvent)
    logger.log(`Event updated: ${docID}`)
  }
  if (beforeDoc.showInCalendar && !afterDoc.showInCalendar) {
    await deleteGEvent(calID, afterDoc.gEventID)
    const docRef = db.collection('events').doc(docID)
    await docRef.update({
      gEventID: null
    })
    logger.log(`Event deleted: ${docID}`)
  }
  if (!beforeDoc.showInCalendar && afterDoc.showInCalendar) {
    const resEvent = await createGEvent(calID, gEvent)
    const docRef = db.collection('events').doc(docID)
    await docRef.update({
      gEventID: resEvent.id
    })
    logger.log(`Event created: ${resEvent.id}`)
  }
})

exports.onDeleteEvent = onDocumentDeleted({ document: "/events/{docID}", region: "europe-west3", database: "(default)" }, async (event) => {
  const docID = event.params.docID
  const data = event.data.data()

  if (data.gEventID === null && data.showInCalendar) {
    logger.error(`Wanted to delete event, but no gEventID found: ${docID}`)
    // jmToDo: LOG ERROR
    return
  }
  if (data.gEventID !== null) {
    try {
      await deleteGEvent(calendars[data.type?.value], data.gEventID)
      logger.log(`Event deleted: ${docID}`)
      return
    } catch (error) {
      logger.error(`Could not delete event: ${error.message}`)
      return
    }
  }
  logger.log(`No event to delete from calendar: ${docID}`)
  return
})

exports.createGEvent = onCall({ cors: true, region: "europe-west3" }, async (request) => {
  if (!request.auth || !request.auth.token || !request.auth.token.uid) {
    throw new HttpsError('permission-denied', 'Du musst angemeldet sein, um Kalendereinträge erstellen zu können.')
  }
  if (!['admin', 'stafue', 'fuehrung'].includes(request.auth?.token?.role)) {
    throw new HttpsError('permission-denied', 'Nur Admins, die StaFü und Fuehrungen dürfen Kalendereinträge erstellen.')
  }

  if (request.data?.title == null) { throw new HttpsError('no-title', 'Bitte gib einen Titel für das Event an.') }
  if (request.data?.start == null) { throw new HttpsError('no-start', 'Bitte gib ein Start-Datum für das Event an.') }
  if (request.data?.end == null) { throw new HttpsError('no-end', 'Bitte gib ein End-Datum für das Event an.') }
  let start = null
  let end = null
  if (request.data?.allDay) {
    start = { date: toZonedTime(new Date(request.data?.start), 'Europe/Berlin').toISOString()?.split('T')[0] }
    end = { date: toZonedTime(new Date(request.data?.end), 'Europe/Berlin').toISOString()?.split('T')[0] }
  } else {
    start = { dateTime: new Date(request.data?.start), timeZone: 'Europe/Berlin' }
    end = { dateTime: new Date(request.data?.end), timeZone: 'Europe/Berlin' }
  }

  logger.log(`originalstart: ${request.data?.start}`)
  logger.log(`originalend: ${request.data?.end}`)
  logger.log(`start: ${start.date}`)
  logger.log(`end: ${end.date}`)

  const gEvent = {
    summary: request.data?.title,
    description: request.data?.description || '',
    location: request.data?.location || '',
    start: start,
    end: end,
    source: request.data?.source,
    creator: {
      displayName: 'SMS',
      email: 'sms@stamm-silberfuechse.de'
    }
  }

  // const db = getFirestore()
  const newCalID = calendars[request.data?.type?.value]
  if (request.data?.showInCalendar) {
    try {
      const resEvent = await createGEvent(newCalID, gEvent)
      // const docRef = db.collection('events').doc(request.data?.id)
      // await docRef.update({
      //   gEventID: resEvent.id
      // })
      logger.log(`GEvent created: ${resEvent.id}`)
      return resEvent.id
    } catch (error) {
      // jmToDo: LOG ERROR
      throw new HttpsError('create-event-error', `Google-Kalender-Eintrag konnte nicht erstellt werden: ${error.message}`)
    }
  } else {
    logger.log(`New GEvent shall not be shown in calendar: ${request.data?.id}`)
    return null
  }
})

exports.updateGEvent = onCall({ cors: true, region: "europe-west3" }, async (request) => {
  if (!request.auth || !request.auth.token || !request.auth.token.uid) {
    throw new HttpsError('permission-denied', 'Du musst angemeldet sein, um Kalendereinträge ändern zu können.')
  }
  if (!['admin', 'stafue', 'fuehrung'].includes(request.auth?.token?.role)) {
    throw new HttpsError('permission-denied', 'Nur Admins, die StaFü und Fuehrungen dürfen Kalendereinträge ändern.')
  }

  if (request.data?.title == null) { throw new HttpsError('no-title', 'Bitte gib einen Titel für das Event an.') }
  if (request.data?.start == null) { throw new HttpsError('no-start', 'Bitte gib ein Start-Datum für das Event an.') }
  if (request.data?.end == null) { throw new HttpsError('no-end', 'Bitte gib ein End-Datum für das Event an.') }
  let start = null
  let end = null
  if (request.data?.allDay) {
    start = { date: request.data?.start?.split('T')[0] }
    end = { date: request.data?.end?.split('T')[0] }
  } else {
    start = { dateTime: new Date(request.data?.start), timeZone: 'Europe/Berlin' }
    end = { dateTime: new Date(request.data?.end), timeZone: 'Europe/Berlin' }
  }
  const calID = calendars[request.data?.type?.value]
  const gEventID = request.data?.gEventID
  const docID = request.data?.id

  if (!request.data?.showInCalendar && gEventID === null) {
    logger.log(`Event ${docID} changed, no gEvent-action required.`)
    return
  }

  if (!request.data?.showInCalendar && gEventID !== null) {
    // Delete event
    try {
      await deleteGEvent(calID, gEventID)
      const docRef = db.collection('events').doc(docID)
      await docRef.update({
        gEventID: null
      })
      logger.log(`Event ${docID} changed, GEvent deleted: ${gEventID}`)
      return
    } catch (error) {
      throw new HttpsError('delete-gevent-error', `Could not delete GEvent: ${error.message}`)
    }
  }

  const gEvent = {
    summary: request.data?.title,
    description: request.data?.description || '',
    location: request.data?.location || '',
    start: start,
    end: end,
    source: request.data?.source
  }

  const db = getFirestore()

  if (request.data?.showInCalendar && gEventID === null) {
    // Create Event
    try {
      const resEvent = await createGEvent(newCalID, gEvent)
      const docRef = db.collection('events').doc(docID)
      await docRef.update({
        gEventID: resEvent.id
      })
      logger.log(`Event ${docID} changed, GEvent created: ${resEvent.id}`)
      return resEvent.id
    } catch (error) {
      throw new HttpsError('create-gevent-error', `Could not create GEvent: ${error.message}`)
    }
  }

  // Update gEvent
  try {
    await updateGEvent(calID, gEventID, gEvent)
    logger.log(`Event ${docID} changed, GEvent updated: ${gEventID}`)
  } catch (error) {
    throw new HttpsError('update-gevent-error', `Coult not update GEvent: ${error.message}`)
  }

})

exports.deleteGEvent = onCall({ cors: true, region: "europe-west3" }, async (request) => {
    if (!request.auth || !request.auth.token || !request.auth.token.uid) {
    throw new HttpsError('permission-denied', 'Du musst angemeldet sein, um Kalendereinträge löschen zu können.')
  }
  if (!['admin', 'stafue', 'fuehrung'].includes(request.auth?.token?.role)) {
    throw new HttpsError('permission-denied', 'Nur Admins, die StaFü und Fuehrungen dürfen Kalendereinträge löschen.')
  }

  const calendarID = calendars[request.data?.type?.value]
  const eventID = request.data?.gEventID

  if (request.data?.showInCalendar && eventID !== null) {
    try {
      await deleteGEvent(calendarID, eventID)
      logger.log(`GEvent deleted: ${eventID}`)
      return
    } catch (error) {
      throw new HttpsError('delete-event-error', `Could not delete GEvent: ${error.message}`)
    }
  } else {
    logger.log(`No GEvent to delete from calendar: ${eventID}`)
    return
  }
})
