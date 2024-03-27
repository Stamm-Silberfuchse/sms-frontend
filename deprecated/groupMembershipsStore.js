import { defineStore } from 'pinia'
import { getAuth } from 'firebase/auth'
import { doc, collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore'

import { db } from '@/plugins/firebase'
import { useGroupsStore } from './groups'

const createList = (tree, groups) => {
  const list = []
  if(groups?.find((rec) => rec.groupID === tree.id)) {
    list.push(tree.id)
  }
  let isMemberInSubgroup = false
  tree?.subgroups?.forEach((subtree) => {
    const sublist = createList(subtree, groups)
    if(sublist.length > 0) {
      isMemberInSubgroup = true
      sublist.forEach((id) => {
        list.push(id)
      })
    }
  })
  if(isMemberInSubgroup) {
    list.push(tree.id)
  }
  return list
}

export const useGroupMembershipsStore = defineStore('groupMemberships', {
  state: () => ({
    all: [],
    groups: [],
  }),
  getters: {
    getAll: (state) => state.all,
    getAllSorted: (state) => state.all.sort((a, b) => a.createdTimestamp - b.createdTimestamp),
    getByID: (state) => {
      return (id) => state.all.find((rec) => rec.id === id)
    },
    getGroupsByMemberID: (state) => {
      return (memberID) => {
        return createList(useGroupsStore().getTree[0], state.all.filter((rec) => rec.memberID === memberID))
      }
    },
    getMembersByGroupID: (state) => {
      return (groupID) => {
        return state.all.filter((rec) => rec.groupID === groupID)
      }
    }
  },
  actions: {
    // Fetch all groups
    async fetchAll() {
      const col = collection(db, "group_memberships")
      const colSnapshot = await getDocs(col)
      this.all = []
      colSnapshot.forEach((doc) => {
        this.all.push({id: doc.id, ...doc.data()})
      })
    },

    // Add member to group
    async addMemberToGroup(memberID, groupID) {
      const colRef = collection(db, "group_memberships")
      const payload = {
        groupID: groupID,
        memberID: memberID,
        createdTimestamp: new Date(),
        createdUserID: getAuth().currentUser.uid
      }
      const newDoc = await addDoc(colRef, payload)
        .catch((error) => {
          console.error(error)
          throw error
        })
      await this.fetchAll()
      return {id: newDoc.id, ...payload}
    },

    // Remove member from group
    async removeMemberFromGroup(docID) {
      const docRef = doc(db, "group_memberships", docID)
      await deleteDoc(docRef)
        .catch((error) => {
          console.error(error)
          throw error
        })
      this.all = this.all.filter((rec) => rec.id !== docID)
    }
  }
})
