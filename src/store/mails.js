import { defineStore } from 'pinia'
import { getAuth } from 'firebase/auth'
import { getFirestore, onSnapshot, doc, collection, query, setDoc, getDoc, getDocs, deleteDoc, addDoc, orderBy, where } from 'firebase/firestore'

import { auth, db } from '@/plugins/firebase'

let binding = null

export const useMailsStore = defineStore('mails', {
  state: () => ({
    all: []
  }),
  getters: {
    getAll: (state) => state.all,
    getAllSorted: (state) => {
      return state.all.sort((a, b) => {
        return a.createdTimestamp - b.createdTimestamp
      })
    },
    getByID: (state) => {
      return (id) => state.getAllSorted.find((rec) => rec.id === id)
    },
    getAllByStatus: (state) => {
      return (status) => state.getAllSorted.filter((rec) => rec.status === status)
    },
  },
  actions: {
    ////////////// REALTIME CONNECTION //////////////
    bind() {
      const q = query(collection(db, "mails"), where('status', '!=', 'archived'))
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
    async fetchAll(all=false) {
      let q = query(collection(db, "mails"), where('status', '!=', 'archived'))
      if (all) {
        q = query(collection(db, "mails"))
      }
      const querySnapshot = await getDocs(q)
      this.all = []
      querySnapshot.forEach((doc) => {
        this.all.push({id: doc.id, ...doc.data()})
      })
    },
    async fetchByID(id) {
      console.log(id)
      const docRef = doc(db, "mails", id)
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
      const payload = {
        ...myPayload,
        updatedTimestamp: new Date(),
        updatedUserID: auth.currentUser.uid,
      }
      try {
        const docRef = doc(db, "mails", docID)
        await setDoc(docRef, payload, { merge: true })
      } catch (error) {
        console.error("Error updating document: ", error)
        throw error
      }
      this.fetchByID(docID)
    },

    async deleteMail(docID) {
      try {
        const docRef = doc(db, "mails", docID)
        await deleteDoc(docRef)
        // remove from store
        const index = this.all.findIndex((mail) => mail.id === docID)
        this.all.splice(index, 1)
      } catch (error) {
        console.error("Error removing document: ", error)
        throw error
      }
    }
  }
})
