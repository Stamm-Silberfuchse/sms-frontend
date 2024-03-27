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
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
              class="my-6"
              v-if="loading"
            />
          </v-card>
        </div>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAuth, signInWithCustomToken } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/plugins/firebase'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const router = useRouter()
const route = useRoute()

const loading = ref(false)

onMounted(async () => {
  loading.value = true
  const auth = getAuth()
  if (route.query?.token) {
    await signInWithCustomToken(auth, route.query?.token)
      .catch((error) => {
        console.error(error)
        toast.error('Login fehlgeschlagen. Bitte wende dich an einen Administrator.')
        throw error
      })
    console.log("signInWithCustomToken successful")
    // verify email
    const verifyEmail = httpsCallable(functions, 'verifyEmail')
    await verifyEmail()
      .catch((error) => {
        console.error(error)
        toast.error(error.message)
        throw error
      })
    router.push({ name: 'Set Password' })
  }
})

</script>
