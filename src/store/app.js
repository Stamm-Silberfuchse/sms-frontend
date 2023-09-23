// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    globalLoading: false,
    toastMessage: null
  }),
  actions: {
    setGlobalLoading (value) {
      this.globalLoading = value
    },
    setToastMessage (message) {
      this.toastMessage = message
    }
  },
  getters: {
    getGlobalLoading () {
      return this.globalLoading
    },
    getToastMessage () {
      return this.toastMessage
    }
  }
})
