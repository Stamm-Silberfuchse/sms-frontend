import { defineStore } from 'pinia'
import { getAuth } from 'firebase/auth'
import { doc, collection, getDocs, addDoc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'

import { db, functions } from '@/plugins/firebase'

const calendarIDs = {
  'public': "5e7cde5062074a51cefeaf5c5a41eba13bbf6964f3bfedfc27d063e9f3a3c0d2@group.calendar.google.com",
  'internal': "f060f59443ebdf2590d761cbb81225e5af81d5ee9b457f649b50ec00fe9c7b37@group.calendar.google.com"
}

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    all: []
  }),
  getters: {
    getAll: (state) => state.all,
    getAllSorted: (state) => state.all.sort((a, b) => a.start - b.start),
    getByID: (state) => {
      return (id) => state.all.find((rec) => rec.id === id)
    },
  },
  actions: {
    // Fetch all events
    async fetchAllEvents(calendarID) {
      this.all = []
      const getEvents = httpsCallable(functions, 'getEvents')
      try {
        let calEvents = await getEvents({ calendarID: calendarID })
        calEvents?.data?.items?.forEach(event => {
          this.all.push(myEvent(calendarID, event))
        })
      } catch (error) {
        console.error(error)
        throw error
      }
    },

    // Fetch event
    async fetchEvent(calendarID, eventID) {
      const getEvent = httpsCallable(functions, 'getEvent')
      try {
        let calEventID = await getEvent({ calendarID: calendarID, eventID: eventID })
        if(this.all.find((rec) => rec.id === calEventID)) {
          const index = this.all.findIndex((rec) => rec.id === calEventID)
          this.all[index] = myEvent(calendarID, calEventID)
        } else {
          this.all.push(myEvent(calendarID, calEventID))
        }
      } catch (error) {
        console.error(error)
        throw error
      }
    },

    // Add event
    async addEvent(calendarID, payload) {
      const createEvent = httpsCallable(functions, 'createEvent')

      try {
        let calEvent = await createEvent({
          calendarID: calendarIDs[payload.type],
          title: payload.title,
          description: payload.description,
          location: payload.location,
          start: {
            dateTime: payload.startDateTime,
          },
          end: {
            dateTime: payload.endDateTime,
          },
        })
        this.all.push(myEvent(calendarID, calEvent?.data))
      } catch (error) {
        console.error(error)
        throw error
      }
    },

    // Update event
    async updateEvent(docID, myPayload, merge=true) {
      const docRef = doc(db, "events", docID)
      const payload = {
        ...myPayload,
        updatedTimestamp: new Date(),
        updatedUserID: getAuth().currentUser.uid
      }
      await updateDoc(docRef, payload, { merge: merge })
        .catch((error) => {
          console.error(error)
          throw error
        })
      Object.keys(payload).forEach((key) => {
        this.all.find((rec) => rec.id === docID)[key] = payload[key]
      })
      return this.all.find((rec) => rec.id === docID)
    },

    // Delete event
    async deleteEvent(calendarID, eventID) {
      const deleteEvent = httpsCallable(functions, 'deleteEvent')
      try {
        let calEvent = await deleteEvent({
          calendarID: calendarID,
          eventID: eventID
        })
        this.all = this.all.filter((rec) => rec.id !== eventID)
        return calEvent
      } catch (error) {
        console.error(error)
        throw error
      }
    }
  }
})
