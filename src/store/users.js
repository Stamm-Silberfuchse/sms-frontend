import { defineStore } from 'pinia'
import { getAuth } from 'firebase/auth'
import { onSnapshot, doc, collection, query, addDoc, setDoc, getDoc, getDocs } from 'firebase/firestore'

import { db } from '@/plugins/firebase'

let binding = null

export const useUsersStore = defineStore('users', {
  state: () => ({
    all: []
  }),
  getters: {
    getAllUsers: (state) => state.all,
    getByID: (state) => {
      return (id) => state.all.find((rec) => rec.id === id)
    },
    getAllByRole: (state) => {
      return (role) => state.all.filter((user) => user.role === role)
    },
  },
  actions: {
    ////////////// REALTIME CONNECTION //////////////
    bind() {
      const q = query(collection(db, "users"))
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
    // Fetch all users
    async fetchAll() {
      const q = query(collection(db, "users"))
      const querySnapshot = await getDocs(q)
      this.all = []
      querySnapshot.forEach((doc) => {
        this.all.push({id: doc.id, ...doc.data()})
      })
    },
    async fetchUser(uid) {
      const docRef = doc(db, "users", uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        if(this.all.find((user) => user.id === docSnap.id)) {
          const index = this.all.findIndex((user) => user.id === docSnap.id)
          this.all[index] = {id: docSnap.id, ...docSnap.data()}
        } else {
          this.all.push({id: docSnap.id, ...docSnap.data()})
        }
      } else {
        console.log("No such document!")
      }
    },

    // add user
    async addUser(payload) {
      const docRef = collection(db, "users")
      await addDoc(docRef, payload)
        .catch((error) => {
          console.error(error)
          throw error
        })
    },

    // edit user
    async updateUser(uid, myPayload) {
      const docRef = doc(db, "users", uid)
      const payload = {
        ...myPayload,
        updatedTimestamp: new Date(),
        updatedUserID: getAuth().currentUser.uid
      }
      await setDoc(docRef, payload, { merge: true })
    },

    // no functionality for adding/editing/deleting users

  }
})
