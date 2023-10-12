import { defineStore } from 'pinia'
import { supabase } from '@/plugins/supabase'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: []
  }),
  actions: {
    async fetchAllUsers() {
      const { data, error, status } = await supabase
          .from('profiles')
          .select(`username, full_name, display_name, avatar_url`)
      if (error) {
        console.error(error)
        throw error
      }
      if (data) {
        this.users = data
      }
    }
  }
})
