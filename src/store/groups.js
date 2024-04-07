import { defineStore } from 'pinia'
import { getAuth } from 'firebase/auth'
import { doc, collection, getDoc, getDocs, addDoc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore'

import { db } from '@/plugins/firebase'

const addSubTree = (tree, all, lastOrd) => {
  tree.ord = lastOrd + 1
  lastOrd = tree.ord
  for(let i = 0; i < tree?.children?.length; i++) {
    const subgroupID = tree?.children[i]
    const doc = all?.find((rec) => rec.id === subgroupID)
    tree.subgroups.push(doc)
    if(tree?.subgroups?.length > 0) {
      [tree.subgroups[tree?.subgroups?.length - 1], lastOrd] = addSubTree(tree?.subgroups[tree?.subgroups?.length - 1], all, lastOrd)
    }
  }
  return [tree, lastOrd]
}

export const useGroupsStore = defineStore('groups', {
  state: () => ({
    all: [],
    tree: null
  }),
  getters: {
    getAll: (state) => state.all,
    getAllSorted: (state) => state.all.sort((a, b) => a.createdTimestamp - b.createdTimestamp),
    getByID: (state) => {
      return (id) => state.all.find((rec) => rec.id === id)
    },
    getTree: (state) => state.tree,
    getGroupByChild: (state) => {
      return (childID) => {
        return state.all.find((rec) => rec.children.includes(childID))
      }
    }
  },
  actions: {
    // Fetch all groups
    async fetchAll() {
      const colRef = collection(db, "groups")
      const colSnapshot = await getDocs(colRef)
      this.all = []
      colSnapshot.forEach((doc) => {
        this.all.push({id: doc.id, ...doc.data(), subgroups: []})
      })

      // create tree structure
      this.tree = this.all.find((rec) => rec.id === 'root') // adding root
      if (this.tree !== undefined) {
        this.tree = [addSubTree(this.tree, this.all, -1)[0]]
      }
    },

    // Add group
    async addGroup(myPayload) {
      const colRef = collection(db, "groups")
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
      // add as child to root
      const rootDocRef = doc(db, "groups", 'root')
      const rootDoc = await getDoc(rootDocRef)
        .catch((error) => {
          console.error(error)
          throw error
        })
      await updateDoc(rootDocRef, {children: [...rootDoc.data().children, newDoc.id]})
        .catch((error) => {
          console.error(error)
          throw error
        })
      await this.fetchAll()
      return {id: newDoc.id, ...payload}
    },

    // Update group
    async updateGroup(docID, myPayload, merge=true) {
      const docRef = doc(db, "groups", docID)
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
      await this.fetchAll()
      return this.all.find((rec) => rec.id === docID)
    },

    // Set group
    async setGroup(docID, myPayload, merge=true) {
      const docRef = doc(db, "groups", docID)
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
      await this.fetchAll()
      return this.all.find((rec) => rec.id === docID)
    },

    // Delete group
    async deleteGroup(docID) {
      const docRef = doc(db, "groups", docID)
      await this.fetchAll()
      await deleteDoc(docRef)
        .catch((error) => {
          console.error(error)
          throw error
        })
      // delete entry in parent's group
      const parent = this.all.find((rec) => rec.children.includes(docID))
      const children = parent.children.filter((child) => child !== docID)
      let payload = await getDoc(doc(db, "groups", parent.id))
      payload = payload.data()
      payload.children = children
      await this.updateGroup(parent.id, payload, false)
      await this.fetchAll()
    }
  }
})
