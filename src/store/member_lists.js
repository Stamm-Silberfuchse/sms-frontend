import { defineStore } from 'pinia'
import { getAuth } from 'firebase/auth'
import { doc, collection, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore'

import { db } from '@/plugins/firebase'

export const useMemberListsStore = defineStore('memberLists', {
  state: () => ({
    all: []
  }),
  getters: {
    getAll: (state) => state.all?.sort((a, b) => {
      if (a.default) return -1;
      if (b.default) return 1;
      return a.name.localeCompare(b.name)
    }),
    getByID: (state) => {
      return (id) => state.all.find((rec) => rec.id === id)
    },
    getDefault: (state) => state.all.find((rec) => rec.default)
  },
  actions: {
    /////////////////////////////////////////////////
    // Fetch all member_lists
    async fetchAll() {
      const colRef = query(collection(db, "member_lists"), orderBy("default", "desc"))
      const colSnapshot = await getDocs(colRef)
      this.all = []
      colSnapshot.forEach((doc) => {
        this.all.push({id: doc.id, ...doc.data()})
      })
    },

    // Add member_list
    async addMemberList(myPayload) {
      const docRef = collection(db, "member_lists")
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
      const newDoc = await getDoc(fbDoc)
      this.all.push({id: newDoc.id, ...newDoc.data() })
      return fbDoc.id
    },

    // Update member_list
    async updateMemberList(docID, myPayload) {
      const docRef = doc(db, "member_lists", docID)
      const payload = {
        ...myPayload,
        updatedTimestamp: new Date(),
        updatedUserID: getAuth().currentUser.uid
      }
      await updateDoc(docRef, payload, { merge: true })
      await this.fetchAll()
      return docID
    },

    // Delete member_list
    async deleteMemberList(docID) {
      const docRef = doc(db, "member_lists", docID)
      try {
        await deleteDoc(docRef)
        await this.fetchAll()
      } catch (error) {
        console.error(error)
        throw error
      }
    }
  }
})
