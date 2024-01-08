import { defineStore } from 'pinia'
import { getAuth } from 'firebase/auth'
import { onSnapshot, doc, collection, getDoc, getDocs, addDoc, setDoc, deleteDoc } from 'firebase/firestore'

import { db } from '@/plugins/firebase'

let binding = null

export const useMembersStore = defineStore('members', {
  state: () => ({
    all: []
  }),
  getters: {
    getAll: (state) => state.all,
    getByID: (state) => {
      return (id) => state.all.find((rec) => rec.id === id)
    },
  },
  actions: {
    ////////////// REALTIME CONNECTION //////////////
    bind() {
      const colRef = collection(db, "members")
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
    // Fetch all members
    async fetchAll() {
      const colRef = collection(db, "members")
      const colSnapshot = await getDocs(colRef)
      this.all = []
      colSnapshot.forEach((doc) => {
        this.all.push({id: doc.id, ...doc.data()})
      })
    },
    // Fetch one member
    async fetchMember(uid) {
      const docRef = doc(db, "members", uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const index = this.all.findIndex((rec) => rec.id === docSnap.id)
        if(index >= 0) {
          this.all[index] = {id: docSnap.id, ...docSnap.data()}
        } else {
          this.all.push({id: docSnap.id, ...docSnap.data()})
        }
      } else {
        console.log("No such document!")
      }
    },

    // Add member
    async addMember(myPayload) {
      const docRef = collection(db, "members")
      const payload = {
        ...myPayload,
        createdTimestamp: new Date(),
        createdUserID: getAuth().currentUser.uid
      }
      const fbDoc = await addDoc(docRef, payload)
        .catch((error) => {
          console.error(error)
          throw error
        })
      this.all.push({
        id: fbDoc.id,
        ...payload,
        createdTimestamp: new Date(),
        createdUserID: getAuth().currentUser.uid
      })
      return fbDoc.id
    },

    // Update Member
    async updateMember(docID, myPayload) {
      const docRef = doc(db, "members", docID)
      const payload = {
        ...myPayload,
        updatedTimestamp: new Date(),
        updatedUserID: getAuth().currentUser.uid
      }
      await setDoc(docRef, payload, { merge: true })
      await this.fetchMember(docID)
      return docID
    },

    // Delete Member
    async deleteMember(docID) {
      const docRef = doc(db, "members", docID)
      await deleteDoc(docRef)
    },

  }
})
