import { defineStore } from 'pinia'
import { getAuth } from 'firebase/auth'
import { doc, collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore'

import { db } from '@/plugins/firebase'

export const useRelUsersMembersStore = defineStore('relUsersMembersStore', {
  state: () => ({
    all: [],
  }),
  getters: {
    getAll: (state) => state.all,
    getByID: (state) => state.all.find((rec) => rec.id === id),
    getByMemberID: (state) => {
      return (memberID) => {
        return state.all.find((rec) => rec.memberID === memberID)
      }
    },
    getByUserID: (state) => {
      return (userID) => {
        return state.all.filter((rec) => rec.userID === userID)
      }
    }
  },
  actions: {
    // Fetch all groups
    async fetchAll() {
      const col = collection(db, "rel_users_members")
      const colSnapshot = await getDocs(col)
      this.all = []
      colSnapshot.forEach((doc) => {
        this.all.push({id: doc.id, ...doc.data()})
      })
    },

    async fetchByUserID(uid) {
      this.all = this.all.filter((rec) => rec.userID !== uid)
      const col = query(collection(db, "rel_users_members"), where("userID", "==", uid))
      const colSnapshot = await getDocs(col)
      colSnapshot.forEach((doc) => {
        if(this.all.find((rec) => rec.id === doc.id)) {
          const index = this.all.findIndex((rec) => rec.id === calEventID)
          this.all[index] = {id: doc.id, ...doc.data()}
        } else {
          this.all.push({id: doc.id, ...doc.data()})
        }
      })
    },

    // Add rel
    async addRel(userID, memberID) {
      const colRef = collection(db, "rel_users_members")
      const payload = {
        userID: userID,
        memberID: memberID,
        createdTimestamp: new Date(),
        createdUserID: getAuth().currentUser.uid
      }
      const newDoc = await addDoc(colRef, payload)
        .catch((error) => {
          console.error(error)
          throw error
        })
      await this.fetchAll() // naah, sometimes just load the new record
      return {id: newDoc.id, ...payload}
    },

    // Remove member from group
    async removeRel(docID) {
      const docRef = doc(db, "rel_users_members", docID)
      await deleteDoc(docRef)
        .catch((error) => {
          console.error(error)
          throw error
        })
      this.all = this.all.filter((rec) => rec.id !== docID)
    }
  }
})
