import { defineStore } from 'pinia'
import { getAuth } from 'firebase/auth'
import { doc, collection, getDocs, addDoc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore'

import { db } from '@/plugins/firebase'

export const useEventsStore = defineStore('events', {
  state: () => ({
    all: []
  }),
  getters: {
    getAll: (state) => state.all,
    getAllSorted: (state) => state.all.sort((a, b) => a.createdTimestamp - b.createdTimestamp),
    getByID: (state) => {
      return (id) => state.all.find((rec) => rec.id === id)
    },
  },
  actions: {
    // Fetch all events
    async fetchAllEvents() {
      const colRef = collection(db, "events")
      const colSnapshot = await getDocs(colRef)
      this.all = []
      colSnapshot.forEach((doc) => {
        this.all.push({id: doc.id, ...doc.data()})
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
      const newDoc = await addDoc(colRef, payload)
        .catch((error) => {
          console.error(error)
          throw error
        })
      return {id: newDoc.id, ...payload}
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

    // Set event
    async setEvent(docID, myPayload, merge=true) {
      const docRef = doc(db, "events", docID)
      const payload = {
        ...myPayload,
        updatedTimestamp: new Date(),
        updatedUserID: getAuth().currentUser.uid
      }
      await setDoc(docRef, payload, { merge: merge })
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
    async deleteEvent(docID) {
      const docRef = doc(db, "events", docID)
      await deleteDoc(docRef)
        .catch((error) => {
          console.error(error)
          throw error
        })
      this.all = this.all.filter((rec) => rec.id !== docID)
    }
  }
})
