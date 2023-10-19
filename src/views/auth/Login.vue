<template>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height mx-2">
      <div class="main-div">
        <v-img height="200" src="@/assets/logo_weiss.svg" />

        <h1 class="text-h2 font-weight-bold mt-10 text-white font-quicksand">SMS</h1>

        <div v-if="formState === 'login'" style="height: 300px">
          <v-card
            class="mx-auto mt-10 pa-12 pb-8"
            elevation="8"
            max-width="448"
            rounded="lg"
          >
            <v-form
              ref="form"
              v-model="valid"
              fast-fail
              @submit.prevent
            >
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
                class="pb-2"
              ></v-text-field>

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
                @click="onSignIn"
              >
                Anmelden
              </v-btn>
            </v-form>

            <v-row>
              <v-col class="d-flex align-center justify-end">
                <v-btn variant="text" class="text-primary text-none" x-small @click="formState='pw-reset'">
                  Passwort vergessen?
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </div>

        <div v-else style="height: 300px">
          <v-card
            class="mx-auto mt-10 pa-12 pb-8"
            elevation="8"
            max-width="448"
            rounded="lg"
          >

            <v-text-field
              v-model="email"
              density="compact"
              placeholder="E-Mail"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              color="primary"
            ></v-text-field>

            <v-btn
              block
              class="mb-3"
              color="primary"
              size="large"
              variant="tonal"
              @click="onResetPW"
            >
              Passwort zurücksetzen
            </v-btn>

            <v-row>
              <v-col class="d-flex align-center justify-start">
                <v-btn
                  variant="text"
                  class="text-primary text-none"
                  x-small
                  @click="formState='login'"
                  prepend-icon="mdi-arrow-left"
                >
                  Anmelden
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </div>
      </div>

    </v-responsive>
  </v-container>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { signIn, resetPW } from '@/plugins/supabase'
  import { toast } from 'vue3-toastify'
  import 'vue3-toastify/dist/index.css'

  const router = useRouter()
  const route = useRoute()

  const loading = ref(false)
  const valid = ref(false)

  const visible = ref(false)
  const formState = ref('login')

  const email = ref('johannesmichaelis0@gmail.com')
  const password = ref('joh_Test_1')

  const emailRules = ref([
    value => {
      if (value) return true
      return 'Bitte gib eine Mail-Adresse an.'
    },
    value => {
      if (/.+@stamm-silberfuechse.de/.test(value)) return true
      if (value === import.meta.env.VITE_ADMIN_MAIL) return true
      return 'Bitte gib deine Silberfuchs-Mail-Adresse an.'
    },
  ])

  const pwRules = ref([
    value => {
      if (value) return true
      return 'Bitte gib ein Passwort an.'
    },
    value => {
      if (value?.length > 9) return true
      return 'Dein Passwort hat mindestens 10 Zeichen.'
    },
  ])

  const onSignIn = async () => {
    loading.value = true
    const data = await signIn(email.value, password.value)
    if (data != null) {
      router.push(route.query.redirect || { name: 'Home' })
      toast.success('Anmeldung erfolgreich')
    }
    loading.value = false
  }

  const onResetPW = () => {
    resetPW(email.value)
  }
</script>
