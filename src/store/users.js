import { defineStore } from 'pinia'
import { supabase } from '@/plugins/supabase'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: []
  }),
  actions: {
    async fetchAllUsers() {
      const { data, error } = await supabase
          .from('profiles')
          .select(`*`)
      if (error) {
        console.error(error)
        throw error
      }
      if (data) {
        this.users = data
      }
    },
    updateUserStatus(uuid, status) {
      this.users.find(user => user.id === uuid).status = status
    }
  },
  getters: {
    getAmountOfUsers () {
      return this.users.length
    },
    getAmountOfUsersRegistered () {
      return this.users.filter(user => user.status === 'registered').length
    },
  }
})
