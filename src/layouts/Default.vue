<template>
  <v-app id="inspire">
    <v-app-bar elevation="0">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-img
        class="ml-2"
        src="@/assets/logo_rot.svg"
        max-height="35"
        max-width="35"
        contain
      />

      <v-app-bar-title class="font-nistra appbar-title">SMS</v-app-bar-title>

      <v-btn @click="switchLoading">
        <v-icon :color="app.globalLoading ? 'primary' : 'grey-lighten-1'">mdi-bell</v-icon>
      </v-btn>

      <template v-slot:append>
        <v-switch
          v-model="darkMode"
          hide-details
          class="mr-2"
          @click.prevent="switchTheme"
        >
          <template v-slot:prepend>
            <v-icon :color="!darkMode ? 'primary' : ''">mdi-white-balance-sunny</v-icon>
          </template>
          <template v-slot:append>
            <v-icon :color="darkMode ? 'primary' : ''">mdi-moon-waning-crescent</v-icon>
          </template>
        </v-switch>
      </template>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
    >
      <v-list nav :lines="false">
        <div v-for="(item, i) in navProperties" :key="i">

          <v-list-item
            v-if="!item.children"
            :to="item.link"
            color="primary"
          >
            <template v-slot:prepend>
              <v-icon>{{ item.icon }}</v-icon>
            </template>
            <v-list-item-title v-text="item.title"></v-list-item-title>
          </v-list-item>

          <v-list-group
            v-else
            :value="item.title"
            no-action
            color="primary"
          >
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                :title="item.title"
                class="mb-0 py-2"
              >
                <template v-slot:prepend>
                  <v-icon>{{ item.icon }}</v-icon>
                </template>
              </v-list-item>
            </template>

            <v-list-item
              v-for="(child, i) in item.children"
              :key="i"
              :title="child.title"
              :prepend-icon="child.icon"
              :value="child.title"
              :to="child.link"
              color="primary"
              class="sub-list-item"
            ></v-list-item>
          </v-list-group>
        </div>
      </v-list>

      <template v-slot:append>
        <v-divider />
        <v-list-item lines="two">
          <v-list-item-title v-text="user.details.full_name" />
          <v-list-item-subtitle v-text="user.email" />
          <template v-slot:append>
            <v-btn icon="mdi-logout" variant="text" color="primary" @click="onSignOut"/>
          </template>
        </v-list-item>
      </template>
      <!--
      <template v-slot:append>
        <v-divider />
        <v-list-item lines="two">
          <template v-slot:prepend>
            <v-avatar size="26px" :image="user.photoURL" />
          </template>
          <v-list-item-title v-text="user.displayName" />
          <v-list-item-subtitle v-text="user.email" />
          <template v-slot:append>
            <v-btn icon="mdi-logout" variant="text" color="blue-lighten-3" @click="logOut()"/>
          </template>
        </v-list-item>
      </template>
      -->
    </v-navigation-drawer>

    <v-main class="mb-8">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { signOut } from '@/plugins/supabase'
import { useCookies } from "vue3-cookies"
import { useAppStore } from '@/store/app'

import { useUserStore } from '@/store/user'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const { cookies } = useCookies()

const theme = useTheme()
const darkMode = ref(true)

const router = useRouter()

const app = useAppStore()
const user = useUserStore()

const drawer = ref(false)

onMounted(() => {
  darkMode.value = cookies.get('themeMode') === 'darkTheme'
  theme.global.name.value = darkMode.value ? 'darkTheme' : 'lightTheme'
})

const onSignOut = () => {
  signOut().then(() => {
    toast.success('Abmeldung erfolgreich')
    router.push({ name: 'Anmelden' })
  })
}

const switchTheme = () => {
  darkMode.value = !darkMode.value
  theme.global.name.value = darkMode.value ? 'darkTheme' : 'lightTheme'
  cookies.set('themeMode', theme.global.name.value)
}

const switchLoading = () => {
  app.setGlobalLoading(!app.globalLoading)
}
</script>

<script>
export default {
  data: () => ({
    drawer: true,
    navProperties: [
      {
        title: 'Dashboard',
        icon: 'mdi-view-dashboard-outline',
        link: '/'
      },
      {
        title: 'Mails',
        icon: 'mdi-email-outline',
        link: '/mails'
      },
      {
        title: 'Kalender',
        icon: 'mdi-calendar',
        children: [
          {
            title: 'Übersicht',
            icon: 'mdi-calendar-month-outline',
            link: '/calendar/alles'
          },
          {
            title: 'Heimbelegung',
            icon: 'mdi-home-clock-outline',
            link: '/calendar/heim'
          },
          {
            title: 'Fahrten & Lager',
            icon: 'mdi-calendar-star',
            link: '/calendar/fahrten-lager'
          }
        ]
      },
      {
        title: 'Dokumente & Vorlagen',
        icon: 'mdi-file-document-outline',
        link: '/docs'
      },
      {
        title: 'ToDos',
        icon: 'mdi-check-all',
        link: '/todos'
      },
      {
        title: 'Mitgliederverwaltung',
        icon: 'mdi-account-group',
        link: '/members'
      },
    ]
  }),
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Borel&display=swap');

.appbar-title {
  font-size: 30px !important;
  padding-top: 20px;
}

.v-toolbar-title {
  line-height: unset !important;
}

.v-list-group__items {
  --indent-padding: 16px !important;
}

</style>
