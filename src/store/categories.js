import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { getAuth } from 'firebase/auth'
import { onSnapshot, doc, collection, getDoc, getDocs, addDoc, setDoc, deleteDoc } from 'firebase/firestore'

import { db } from '@/plugins/firebase'

let binding = null

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    all: []
  }),
  getters: {
    getAll: (state) => state.all,
    getAllSorted: (state) => state.all.sort((a, b) => a.order - b.order),
    getByID: (state) => {
      return (id) => state.all.find((rec) => rec.id === id)
    },
  },
  actions: {
    ////////////// REALTIME CONNECTION //////////////
    bind() {
      const colRef = collection(db, "categories")
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
    // Fetch all categories
    async fetchAll() {
      const colRef = collection(db, "categories")
      const colSnapshot = await getDocs(colRef)
      this.all = []
      colSnapshot.forEach((doc) => {
        this.all.push({id: doc.id, ...doc.data()})
      })
    },

    // Add category
    async addCategory(myPayload) {
      const colRef = collection(db, "categories")
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
      this.fetchAll()
      return {id: newDoc.id, ...payload}
    },

    // Update category
    async updateCategory(docID, myPayload) {
      const docRef = doc(db, "categories", docID)
      const payload = {
        ...myPayload,
        updatedTimestamp: new Date(),
        updatedUserID: getAuth().currentUser.uid
      }
      await setDoc(docRef, payload, { merge: true })
        .catch((error) => {
          console.error(error)
          throw error
        })
      this.fetchAll()
      return doc.id
    },

    // Delete Category
    async deleteCategory(docID, deleteLocally=false) {
      const docRef = doc(db, "categories", docID)
      await deleteDoc(docRef)
        .catch((error) => {
          console.error(error)
          throw error
        })
      if(deleteLocally) {
        this.all = this.all.filter((rec) => rec.id !== docID)
      }
    }
  }
})
