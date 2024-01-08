<template>
  <div>
    <v-app v-if="!loading" id="inspire">
      <v-app-bar elevation="0">
        <v-app-bar-nav-icon
          v-if="mobileNavigation"
          @click="drawer = !drawer"
        >
        </v-app-bar-nav-icon>

        <router-link to="/" style="width: 50px;">
          <v-img
            :class="mobileNavigation ? 'ml-2' : 'ml-4'"
            :src="logoFile"
            max-height="35"
            max-width="35"
            contain
          />
        </router-link>

        <router-link to="/" class="title-link font-nistra appbar-title ml-3 mt-1">
          <span>SMS</span>
        </router-link>

        <v-spacer />

        <v-btn
          v-if="notifications.length > 0"
          icon
          class="mr-1"
          :to="{ name: 'Benachrichtigungen' }"
        >
          <v-badge
            :content="notifications.length"
            :value="notifications.length"
            color="primary"
            overlap
            class="mr-3"
          >
            <v-icon :color="appStore.globalLoading ? 'primary' : 'grey-lighten-1'">
              mdi-bell
            </v-icon>
          </v-badge>
        </v-btn>
      </v-app-bar>

      <div :class="mobileNavigation ? 'nav-drawer-mobile' : 'nav-drawer'">
        <v-navigation-drawer
          v-model="drawer"
          :expand-on-hover="!mobileNavigation"
          :rail="!mobileNavigation"
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
            <v-list nav :lines="false">
              <v-list-item
              title="Admin"
                prepend-icon="mdi-shield-account"
                :to="{ name: 'Admin' }"
                color="primary"
              ></v-list-item>
            </v-list>
            <v-divider />
            <v-list nav :lines="false">
              <v-list-item
                title="Einstellungen"
                prepend-icon="mdi-cog"
                :to="{ name: 'Einstellungen' }"
                color="primary"
              ></v-list-item>
            </v-list>
            <v-divider />
            <v-list-item lines="two">
              <template v-slot:prepend>
                <Avatar :userID="authStore?.uid" :to="{ name: 'Account' }" tooltip="Account" />
              </template>
              <v-list-item-title v-text="authStore?.displayName" class="ml-4" />
              <v-list-item-subtitle v-text="authStore?.email" class="ml-4" />
              <template v-slot:append>
                <v-tooltip text="Abmelden">
                  <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-logout" variant="text" color="primary" @click="onSignOut"/>
                  </template>
                </v-tooltip>
              </template>
            </v-list-item>
          </template>
        </v-navigation-drawer>
      </div>

      <v-main>
        <router-view />
      </v-main>
      <!--
      <v-footer style="background-color: var(--v-theme-background); border-top: 1px solid #AAA; max-height: 50px;">
        <v-row justify="center" no-gutters>
          <v-col class="my-3" cols="auto">
            {{ new Date().getFullYear() }} — <strong>Stamm Silberfüchse</strong>
          </v-col>
        </v-row>
      </v-footer>
      -->
    </v-app>
    <v-app v-else>
      <v-main>
        <v-container class="fill-height">
          <v-responsive class="align-center text-center fill-height mx-2">
            <div class="main-div">
              <v-row justify="center">
                <v-col cols="6">
                  <v-progress-linear
                    color="primary"
                    indeterminate
                    rounded
                    height="6"
                    style="max-width: 150px;"
                  />
                </v-col>
              </v-row>
            </div>
          </v-responsive>
        </v-container>
      </v-main>
    </v-app>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { signOut } from '@/plugins/firebase'
import { useCookies } from 'vue3-cookies'

import { useAppStore } from '@/store/app'
import { useAuthStore } from '@/store/auth'
import { useUsersStore } from '@/store/users'
import { useCategoriesStore } from '@/store/categories'

import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import Avatar from '@/components/Avatar.vue'

const { cookies } = useCookies()

const theme = useTheme()

const route = useRoute()
const router = useRouter()

const appStore = useAppStore()
const authStore = useAuthStore()
const usersStore = useUsersStore()
const categoriesStore = useCategoriesStore()

const drawer = ref(true)

const displayWidth = ref(1920)

const notifications = ref(['ghost']) // TODO: Implement notifications

const loading = ref(true)

onMounted(async () => {
  loading.value = true
  // theme
  // set theme
  let darkMode = false
  if(cookies.isKey('theme')) {
    darkMode = cookies.get('theme').includes('dark')
  }
  let mytheme = darkMode ? 'darkTheme' : 'lightTheme'
  cookies.set('theme', mytheme)
  theme.global.name.value = mytheme

  // navbar
  window.addEventListener('resize', onResize, { passive: true })
  onResize()

  // load Stores
  await categoriesStore.fetchAll()
  await usersStore.fetchAll()
  loading.value = false
})

const onSignOut = () => {
  signOut()
    .then(() => {
      router.push({ name: 'Anmelden' })
    })
}

const onResize = () => {
  displayWidth.value = window.innerWidth
  if(window.innerWidth < 1280) {
    drawer.value = false
  } else {
    drawer.value = true
  }
}

const logoFile = computed(() => {
  return '/logo_rot' + (theme.global.name.value.includes('dark') ? '_light' : '') + '.svg'
})

const mobileNavigation = computed(() => {
  return displayWidth.value < 1280
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('resize', onResize, { passive: true })
})
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
          },
          {
            title: 'Intern',
            icon: 'mdi-calendar-lock-outline',
            link: '/calendar/intern'
          }
        ]
      },
      /*
      {
        title: 'Fundsachen',
        icon: 'mdi-tag-multiple-outline',
        link: '/lostnfound'
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
      */
      {
        title: 'Verwaltung',
        icon: 'mdi-account-group',
        link: '/orga'
      },
    ]
  }),
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Borel&display=swap');

.appbar-title {
  font-size: 30px !important;
  padding-top: 20px !important;
}

.title-link, .title-link:link, .title-link:visited, .title-link:hover, .title-link:active {
  cursor: pointer;
  text-decoration: none;
  color: var(--v-theme-on-surface);
}

.nav-drawer > nav > div > div > div > .v-list-group > .v-list-group__items .v-list-item {
  transition: all 0.2s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  padding-inline-start: 8px !important;
}

.nav-drawer > nav.v-navigation-drawer--is-hovering > div > div > div > .v-list-group > .v-list-group__items > a {
  padding-inline-start: 20px !important;
}

.nav-drawer-mobile > nav > div > div > div > .v-list-group > .v-list-group__items .v-list-item {
  padding-inline-start: 20px !important;
}

.v-navigation-drawer--is-hovering .sublist-mobile > div > div > div > div > .v-list-group__items > a {
  padding-inline-start: 20px !important;
}

.v-navigation-drawer--rail:not(.v-navigation-drawer--is-hovering.v-navigation-drawer--expand-on-hover) .v-avatar.v-avatar--size-default {
  --v-avatar-height: 24px !important;
}
.v-navigation-drawer--rail:not(.v-navigation-drawer--is-hovering.v-navigation-drawer--expand-on-hover) .v-list-item__append {
  visibility: hidden;
}
</style>
