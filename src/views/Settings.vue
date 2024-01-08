<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
        <PageTitle title="Einstellungen" :loading="loading" />

        <div v-if="!loading" class="mx-3 mt-3 mb-4">
          <v-row>
            <v-col cols="12" md="6" lg="4">
              <v-card variant="tonal" class="pt-1">
                <v-card-title>
                  Theme
                </v-card-title>
                <v-card-text>
                  <v-switch
                    v-model="darkMode"
                    prepend-icon="mdi-theme-light-dark"
                    label="Dunkler Modus"
                    hide-details
                    class="mr-2"
                    @click.prevent="switchTheme"
                  />
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6" lg="4">
              <v-card variant="tonal" class="pt-1">
                <v-card-title>
                  Benachrichtigungen
                </v-card-title>
                <v-card-text>
                  <v-switch
                    v-model="pushNotifications"
                    prepend-icon="mdi-bell"
                    label="Alle Benachrichtigungen"
                    hide-details
                    :color="pushNotifications ? 'primary' : ''"
                    class="mr-2"
                    @click.prevent="onSwitchPushNotifications"
                  />
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6" lg="4">
              <v-card variant="tonal" class="pt-1">
                <v-card-title>
                  E-Mails
                </v-card-title>
                <v-card-text>
                  <v-switch
                    v-model="emailNotifications"
                    prepend-icon="mdi-bell"
                    label="Alle Benachrichtigungen"
                    hide-details
                    :color="emailNotifications ? 'primary' : ''"
                    class="mr-2"
                    @click.prevent="onSwitchEmailNotifications"
                  />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useTheme } from 'vuetify'
import { useCookies } from "vue3-cookies"
import { getAuth } from 'firebase/auth'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useUsersStore } from '@/store/users'

import PageTitle from '@/components/PageTitle.vue'

const { cookies } = useCookies()

const theme = useTheme()

const usersStore = useUsersStore()

const loading = ref(true)

const darkMode = ref(false)
const pushNotifications = ref(false)
const emailNotifications = ref(false)

onMounted(async () => {
  darkMode.value = cookies.get('theme') === 'darkTheme'
  await usersStore.fetchUser(getAuth().currentUser.uid)
  pushNotifications.value = usersStore.getByID(getAuth().currentUser.uid)?.pushNotifications
  emailNotifications.value = usersStore.getByID(getAuth().currentUser.uid)?.emailNotifications
  loading.value = false
})

const switchTheme = () => {
  darkMode.value = !darkMode.value
  theme.global.name.value = darkMode.value ? 'darkTheme' : 'lightTheme'
  cookies.set('theme', theme.global.name.value)
}

const onSwitchPushNotifications = () => {
  pushNotifications.value = !pushNotifications.value
  const uid = getAuth().currentUser.uid
  usersStore.updateUser(uid, { pushNotifications: pushNotifications.value })
  toast.success('Benachrichtigungs-Einstellungen gespeichert')
}

const onSwitchEmailNotifications = () => {
  emailNotifications.value = !emailNotifications.value
  const uid = getAuth().currentUser.uid
  usersStore.updateUser(uid, { emailNotifications: emailNotifications.value })
  toast.success('Benachrichtigungs-Einstellungen gespeichert')
}
</script>
