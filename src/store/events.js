import { defineStore } from 'pinia'
import { getAuth } from 'firebase/auth'
import { doc, collection, getDocs, addDoc, updateDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'

import { db } from '@/plugins/firebase'

let binding = null

export const useEventsStore = defineStore('events', {
  state: () => ({
    all: []
  }),
  getters: {
    getAll: (state) => state.all,
    getAllSortedByCreated: (state) => state.all.sort((a, b) => a.createdTimestamp - b.createdTimestamp),
    getAllSortedByStart: (state) => state.all.sort( (a, b) => a.start?.toDate() - b.start?.toDate() ),
    getByID: (state) => {
      return (id) => state.all.find((rec) => rec.id === id)
    },
  },
  actions: {
    ////////////// REALTIME CONNECTION //////////////
    bind() {
      const q = collection(db, "events")
      binding = onSnapshot(q, (querySnapshot) => {
        this.all = []
        querySnapshot.forEach((doc) => {
          this.all.push({id: doc.id, ...doc.data()})
        })
      })
    },
    unbind() {
      if(binding) binding()
    },
    // Fetch all events
    async fetchAllEvents() {
      const colRef = collection(db, "events")
      const colSnapshot = await getDocs(colRef)
      this.all = []
      colSnapshot.forEach((doc) => {
        this.all.push({
          id: doc.id,
          ...doc.data(),
          calendar: calendarIDs[doc.data().calendarID]
        })
      })
    },

    // Add event
    async addEvent(myPayload) {
      const colRef = collection(db, "events")
      const payload = {
        ...myPayload,
        createdTimestamp: new Date(),
        createdUserID: getAuth().currentUser.uid
      }
      try {
        const newDoc = await addDoc(colRef, payload)
        return {id: newDoc.id, ...payload}
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
      try {
        await updateDoc(docRef, payload, { merge: merge })
        return this.all.find((rec) => rec.id === docID)
      } catch (error) {
        console.error(error)
        throw error
      }
    },

    // Set event
    async setEvent(docID, myPayload, merge=true) {
      const docRef = doc(db, "events", docID)
      const payload = {
        ...myPayload,
        updatedTimestamp: new Date(),
        updatedUserID: getAuth().currentUser.uid
      }
      try {
        await setDoc(docRef, payload, { merge: merge })
        Object.keys(payload).forEach((key) => {
          this.all.find((rec) => rec.id === docID)[key] = payload[key]
        })
        return this.all?.find((rec) => rec.id === docID)
      } catch (error) {
        console.error(error)
        throw error
      }
    },

    // Delete event
    async deleteEvent(docID) {
      const docRef = doc(db, "events", docID)
      try {
        await deleteDoc(docRef)
        this.all = this.all?.filter((rec) => rec.id !== docID)
      } catch (error) {
        console.error(error)
        throw error
      }
    }
  }
})

/*

=== EVENT ===
id: uuid (read-only)
title: string
description: string (may contain HTML)
start: {
  date: string ("jjjj-mm-dd", only if full-day event),
  dateTime: Date,
  timeZone: string ("Europe/Berlin")
}
end: {
  date: string ("jjjj-mm-dd", only if full-day event),
  dateTime: Date,
  timeZone: string ("Europe/Berlin")
}
location: string
attachments[]: {
  fileId: string,
  fileUrl: string,
  iconLink: string,
  mimeType: string,
  title: string
}
colorId: string (jmToDo),
endTimeUnspecified: bool (default: False)
source: {
  title: SMS,
  url: https://sms.stamm-silberfuechse.de
},
calendarID: string,
showInCalendar: bool,
createdTimestamp: Date
createdUserID: string (uid)


*/
