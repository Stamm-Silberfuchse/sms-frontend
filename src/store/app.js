// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    globalLoading: false
  }),
  actions: {
    setGlobalLoading (value) {
      this.globalLoading = value
    }
  },
  getters: {
    getGlobalLoading () {
      return this.globalLoading
    }
  }
})
