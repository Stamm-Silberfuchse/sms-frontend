import { defineStore } from 'pinia'
import { getAuth } from 'firebase/auth'
import { doc, collection, getDoc, getDocs, addDoc, updateDoc, setDoc, deleteDoc, query, where } from 'firebase/firestore'

import { db } from '@/plugins/firebase'

export const useContactsStore = defineStore('contacts', {
  state: () => ({
    all: []
  }),
  getters: {
    getAll: (state) => state.all,
    getAllCurrentUser: (state) => state.all
      ?.filter((rec) => rec.memberID === getAuth().currentUser.uid)
      ?.sort((a, b) => a.order - b.order) || [],
    getAllByMemberID: (state) => {
      return (memberID) => state.all
        ?.filter((rec) => rec.memberID === memberID)
        ?.sort((a, b) => a.order - b.order) || []
    },
    getByID: (state) => {
      return (id) => state.all?.find((rec) => rec.id === id)
    },
  },
  actions: {
    // Fetch all documents
    async fetchAll() {
      const colRef = collection(db, "contacts")
      const colSnapshot = await getDocs(colRef)
        .catch((error) => {
          console.error(error)
          throw error
        })
      this.all = []
      colSnapshot.forEach((doc) => {
        this.all.push({ id: doc.id, ...doc.data() })
      })
    },

    // Fetch single document by ID
    async fetchByID(docID) {
      const docRef = doc(db, "contacts", docID)
      const docSnapshot = await getDoc(docRef)
        .catch((error) => {
          console.error(error)
          throw error
        })
      if (docSnapshot.exists()) {
        const index = this.all.findIndex((rec) => rec.id === docSnapshot.id)
        if(index >= 0) {
          this.all[index] = {id: docSnapshot.id, ...docSnapshot.data()}
        } else {
          this.all.push({id: docSnapshot.id, ...docSnapshot.data()})
        }
      } else {
        console.log("No such document!")
      }
    },

    async fetchContactsByMemberID(memberID) {
      const q = query(collection(db, "contacts"), where("memberID", "==", memberID))
      const querySnapshot = await getDocs(q)
        .catch((error) => {
          console.error(error)
          throw error
        })
      querySnapshot.forEach((doc) => {
        const index = this.all.findIndex((rec) => rec.id === doc.id)
        if(index >= 0) {
          this.all[index] = {id: doc.id, ...doc.data()}
        } else {
          this.all.push({id: doc.id, ...doc.data()})
        }
      })
    },

    // Add contact
    async addContact(myPayload) {
      const colRef = collection(db, "contacts")
      const payload = {
        ...myPayload,
        createdTimestamp: new Date(),
        createdUserID: getAuth().currentUser.uid
      }
      try {
        const newDoc = await addDoc(colRef, payload)
        this.all.push({id: newDoc.id, ...payload})
        return {id: newDoc.id, ...payload}
      } catch (error) {
        console.error(error)
        throw error
      }
    },

    // Update contact
    async updateContact(docID, myPayload, merge=true) {
      const docRef = doc(db, "contacts", docID)
      const payload = {
        ...myPayload,
        updatedTimestamp: new Date(),
        updatedUserID: getAuth().currentUser.uid
      }
      try {
        await updateDoc(docRef, payload, { merge: merge })
        const index = this.all.findIndex((rec) => rec.id === docID)
        this.all[index] = {id: docID, ...payload}
      } catch {
        console.error(error)
        throw error
      }
    },

    // Set contact
    async setContact(docID, myPayload, merge=true) {
      const docRef = doc(db, "contacts", docID)
      const payload = {
        ...myPayload,
        updatedTimestamp: new Date(),
        updatedUserID: getAuth().currentUser.uid
      }
      try {
        await setDoc(docRef, payload, { merge: merge })
        const index = this.all.findIndex((rec) => rec.id === docID)
        this.all[index] = {id: docID, ...payload}
      } catch {
        console.error(error)
        throw error
      }
    },

    // Delete contact
    async deleteContact(docID) {
      const docRef = doc(db, "contacts", docID)
      try {
        await deleteDoc(docRef)
        this.all = this.all.filter((rec) => rec.id !== docID)
      } catch {
        console.error(error)
        throw error
      }
    }
  }
})
