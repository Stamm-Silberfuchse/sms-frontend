// Utilities
import { defineStore } from 'pinia'
import { supabase } from '@/plugins/supabase'


export const useAuthStore = defineStore('auth', {
  state: () => ({
    id: null,
    email: null,
    details: {}
  }),
  actions: {
    async fetchUserDetails() {
      const { data: { session } } = await supabase.auth.getSession()

      try {
        const { data, error, status } = await supabase
          .from('profiles')
          .select(`username, full_name, display_name`)
          .eq('id', session.user.id)
          .single()

        if (error && status !== 406) throw error

        if (data) {
          this.details = { ...data}
        }
      } catch (error) {
        toast.error(error.message)
      }
    }
  }
})
