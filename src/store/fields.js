import { defineStore } from 'pinia'
import { getAuth } from 'firebase/auth'
import { onSnapshot, doc, collection, getDoc, getDocs, addDoc, setDoc, deleteDoc } from 'firebase/firestore'

import { db } from '@/plugins/firebase'

let binding = null

export const useFieldsStore = defineStore('fields', {
  state: () => ({
    all: []
  }),
  getters: {
    getAll: (state) => state.all,
    getAllSorted: (state) => state.all.sort((a, b) => a.order - b.order),
    getByID: (state) => {
      return (id) => state.all.find((rec) => rec.id === id)
    },
    getAllByCategoryID: (state) => {
      return (id) => state.getAllSorted.filter((rec) => rec.categoryID === id)
    }
  },
  actions: {
    ////////////// REALTIME CONNECTION //////////////
    bind() {
      const colRef = collection(db, "fields")
      binding = onSnapshot(colRef, (querySnapshot) => {
        this.all = []
        querySnapshot.forEach((doc) => {
          this.all.push({id: doc.id, ...doc.data()})
        })
      })
    },
    unbind() {
      if(binding) binding()
    },
    /////////////////////////////////////////////////
    // Fetch all fields
    async fetchAll() {
      const colRef = collection(db, "fields")
      const colSnapshot = await getDocs(colRef)
      this.all = []
      colSnapshot.forEach((doc) => {
        this.all.push({id: doc.id, ...doc.data()})
      })
    },

    // Add field
    async addField(myPayload) {
      const colRef = collection(db, "fields")
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
      this.all.push({id: newDoc.id, ...payload})
      return {id: newDoc.id, ...payload}
    },

    // Update field
    async updateField(docID, myPayload, merge=true) {
      const docRef = doc(db, "fields", docID)
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

    // Delete field
    async deleteField(docID) {
      const docRef = doc(db, "fields", docID)
      await deleteDoc(docRef)
        .catch((error) => {
          console.error(error)
          throw error
        })
      this.all = this.all.filter((rec) => rec.id !== docID)
    }
  }
})
