<template>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height mx-2">
      <div class="main-div">
        <v-img height="200" src="@/assets/logo_weiss.svg" />

        <h1 class="text-h2 font-weight-bold mt-10 text-white font-Quicksand">SMS</h1>

        <div style="height: 300px">
          <v-card
            class="mx-auto mt-10 pa-12 pb-8 pt-6"
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
                E-Mail bestätigen
              </v-card-title>
              <v-text-field
                v-model="email"
                density="compact"
                placeholder="E-Mail"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                color="primary"
                autofocus
                required
                autocomplete="email"
                :rules="emailRules"
                class="pb-2 pt-4"
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
                @click="onSubmit()"
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { signIn } from '@/plugins/firebase'
import { getAuth, signInWithEmailLink } from 'firebase/auth'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useAuthStore } from '@/store/auth'

const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()

const loading = ref(false)
const valid = ref(false)

const visible = ref(false)

const email = ref('')

const emailRules = ref([
    value => {
      if (value) return true
      return 'Bitte gib Deine E-Mail-Adresse an.'
    },
  ])

const onSubmit = async () => {
  loading.value = true
  const auth = getAuth()
  await signInWithEmailLink(auth, email.value, window.location.href)
    .then((result) => {
      // You can access the new user via result.user
      // Additional user info profile not available via:
      // result.additionalUserInfo.profile == null
      // You can check if the user is new or existing:
      // result.additionalUserInfo.isNewUser
      console.log(result)
      toast.success('E-Mail-Adresse bestätigt.')
      router.push({ name: 'Onboarding' })
    })
    .catch((error) => {
      // Some error occurred, you can inspect the code: error.code
      // Common errors could be invalid email and invalid or expired OTPs.
      console.error(error)
      toast.error('E-Mail-Adresse konnte nicht bestätigt werden.')
      loading.value = false
      throw error
    })
  loading.value = false
}

</script>
