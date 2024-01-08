import { defineStore } from 'pinia'
import { getAuth } from 'firebase/auth'
import { getFirestore, onSnapshot, doc, collection, query, setDoc, getDoc, getDocs, deleteDoc, addDoc } from 'firebase/firestore'

import { db } from '@/plugins/firebase'

let binding = null

export const useMailsStore = defineStore('mails', {
  state: () => ({
    all: []
  }),
  getters: {
    getAll: (state) => state.all,
    getAllSorted: (state) => {
      return state.all.sort((a, b) => {
        return b.createdTimestamp - a.createdTimestamp
      })
    },
    getByID: (state) => {
      return (id) => state.all.find((rec) => rec.id === id)
    },
    getAllByStatus: (state) => {
      return (status) => state.all.filter((rec) => rec.status === status)
    },
  },
  actions: {
    ////////////// REALTIME CONNECTION //////////////
    bind() {
      const q = query(collection(db, "mails"))
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
    /////////////////////////////////////////////////
    // Fetch all mails
    async fetchAll() {
      const q = query(collection(db, "mails"))
      const querySnapshot = await getDocs(q)
      this.all = []
      querySnapshot.forEach((doc) => {
        this.all.push({id: doc.id, ...doc.data()})
      })
    },
    async fetchMail(uid) {
      const docRef = doc(db, "mails", uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        if(this.all.find((mail) => mail.id === docSnap.id)) {
          const index = this.all.findIndex((mail) => mail.id === docSnap.id)
          this.all[index] = {id: docSnap.id, ...docSnap.data()}
        } else {
          this.all.push({id: docSnap.id, ...docSnap.data()})
        }
      } else {
        console.log("No such document!")
      }
    },

    async addMail(myPayload) {
      const auth = getAuth()
      const db = getFirestore()
      const userID = auth.currentUser.uid
      const payload = {
        ...myPayload,
        createdTimestamp: new Date(),
        createdUserID: userID,
      }
      const docRef = await addDoc(collection(db, "mails"), payload)
        .catch((error) => {
          console.error(error)
          throw error
        })
      return docRef.id
    },

    async updateMail(docID, myPayload) {
      const auth = getAuth()
      const db = getFirestore()
      const payload = {
        ...myPayload,
        updatedTimestamp: new Date(),
        updatedUserID: auth.currentUser.uid,
      }
      await setDoc(doc(db, "mails", docID), payload, { merge: true })
        .catch((error) => {
          console.error(error)
          throw error
        })
      return
    },

    async deleteMail(docID) {
      const db = getFirestore()
      await deleteDoc(doc(db, "mails", docID))
        .catch((error) => {
          console.error(error)
          throw error
        })
      // remove from store
      const index = this.all.findIndex((mail) => mail.id === docID)
      this.all.splice(index, 1)
      return
    }
  }
})
