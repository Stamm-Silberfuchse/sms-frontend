// Plugins
import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// PWA
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ['logo_rot_filled.ico', 'logo_rot_filled.svg', 'logo_rot_filled.png'],
      manifest: {
        name: 'Silberfuchs Management System',
        short_name: 'SMS',
        description: 'Alles an einem Ort',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'logo_rot_filled_192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo_rot_filled_512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3000,
  },
})
