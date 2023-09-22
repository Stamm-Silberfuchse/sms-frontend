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
import { VDataTable } from 'vuetify/labs/VDataTable'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  components: {
    VDataTable,
  },
  theme: {
    defaultTheme: 'lightTheme',
    themes: {
      lightTheme: {
        dark: false,
        colors: {
          primary: '#8d1d23',
          background: '#E0E0E0'
        }
      },
      darkTheme: {
        dark: true,
        colors: {
          primary: '#8d1d23',
          secondary: '#5CBBF6',
        },
      },
      blankTheme: {
        dark: false,
        colors: {
          primary: '#8d1d23',
          background: '#8d1d23',
        }
      },
    },
  },
})
