<template>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height mx-2">
      <div class="main-div">
        <v-img height="200" src="@/assets/logo_weiss.svg" />

        <h1 class="text-h2 font-weight-bold mt-10 text-white font-Quicksand">SMS</h1>

        <div style="height: 300px">
          <v-card
            class="mx-auto mt-10 pa-12 pb-8 pt-4"
            elevation="8"
            max-width="486"
          >
            <v-form
              ref="form"
              v-model="valid"
              fast-fail
              @submit.prevent
            >
              <v-card-title>
                Passwort festlegen
              </v-card-title>
              <v-text-field
                v-model="password"
                :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                :type="visible ? 'text' : 'password'"
                density="compact"
                placeholder="Passwort"
                prepend-inner-icon="mdi-lock-outline"
                variant="outlined"
                color="primary"
                counter
                autocomplete="current-password"
                required
                :rules="pwRules"
                class="pb-2 pt-4"
                @click:append-inner="visible = !visible"
              ></v-text-field>

              <v-text-field
                v-model="password2"
                :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                :type="visible ? 'text' : 'password'"
                density="compact"
                placeholder="Passwort wiederholen"
                prepend-inner-icon="mdi-lock-outline"
                variant="outlined"
                color="primary"
                counter
                autocomplete="current-password"
                required
                :rules="pw2Rules"
                class="pb-2"
                @click:append-inner="visible = !visible"
              ></v-text-field>

              <v-btn
                block
                class="mt-4 mb-3"
                color="primary"
                size="large"
                variant="tonal"
                type="submit"
                :loading="loading"
                :disabled="!valid"
                @click="onSetPasswort"
              >
                Registrierung abschließen
              </v-btn>
            </v-form>
          </v-card>
        </div>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { signIn } from '@/plugins/firebase'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useAuthStore } from '@/store/auth'

const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()

const loading = ref(false)
const valid = ref(false)

const visible = ref(false)

const password = ref('joh_Test_1')
const password2 = ref('joh_Test_1')

const pwRules = ref([
  value => {
    if (value) return true
    return 'Bitte gib ein Passwort an.'
  },
  value => {
    if (value?.length > 9) return true
    return 'Dein Passwort muss mindestens 10 Zeichen beinhalten.'
  },
])

const pw2Rules = ref([
  value => {
    if (value === password?.value) return true
    return 'Dein Passwort stimmt nicht mit dem ersten überein.'
  },
])

const onSetPasswort = async () => {
  loading.value = true
  const data = await authStore.setInitialPassword(route.params.token, password.value)
  console.log(data)
  loading.value = false
}

</script>
