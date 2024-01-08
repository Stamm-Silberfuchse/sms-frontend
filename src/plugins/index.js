/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import { loadFonts } from './webfontloader'
import vuetify from './vuetify'
import pinia from '../store'
import router from '../router'
import Vue3Toastify, { toast } from 'vue3-toastify'
import VuetifyUseDialog from 'vuetify-use-dialog'

export function registerPlugins (app) {
  loadFonts()
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
    .use(Vue3Toastify, {
      autoClose: 3000,
      clearOnUrlChange: false,
      position: toast.POSITION.BOTTOM_RIGHT
    })
    .use(VuetifyUseDialog, {
      confirmDialog: {
        title: '----------',
        content: 'Bist Du sicher?',
        confirmationText: 'Ja',
        cancellationText: 'Nein',
        cardProps: {
          maxWidth: 400,
          class: "mx-auto w-100 confirm-dialog-card"
        }
      }
    })
}
