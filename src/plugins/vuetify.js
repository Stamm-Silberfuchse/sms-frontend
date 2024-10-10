/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// Locales
import { de } from 'vuetify/locale'

// Components
import { VCalendar } from 'vuetify/labs/VCalendar'
import { VTreeview } from 'vuetify/labs/VTreeview'
import { VTimePicker } from 'vuetify/labs/VTimePicker'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  components: {
    VCalendar,
    VTreeview,
    VTimePicker
  },
  theme: {
    defaultTheme: 'lightTheme',
    themes: {
      lightTheme: {
        dark: false,
        colors: {
          primary: '#8d1d23',
          background: '#e0e0e0',
          contrast: '#000000',
          contrastInv: '#ffffff',
          darker: '#d3d3d3'
        }
      },
      darkTheme: {
        dark: true,
        colors: {
          primary: '#cc666b',
          secondary: '#5cbbf6',
          contrast: '#ffffff',
          contrastInv: '#000000',
          darker: '#000000'
        },
      },
      blankTheme: {
        dark: false,
        colors: {
          primary: '#8d1d23',
          background: '#8d1d23',
          contrast: '#000000',
        }
      },
    },
  },
  locale: {
    locale: 'de',
    messages: { de },
  },
  defaults: {
    VBtn: {
      // class: 'pa-16',
      elevation: 0
    },
    VCard: {
      rounded: 'lg'
    },
  },
})
