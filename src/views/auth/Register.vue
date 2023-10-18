<template>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height mx-2">
      <div class="main-div">
        <v-img height="200" src="@/assets/logo_weiss.svg" />

        <h1 class="text-h2 font-weight-bold mt-10 text-white sms-title">SMS</h1>

        <v-card
          class="mx-auto mt-10 pa-12 py-8"
          elevation="8"
          max-width="448"
          rounded="lg"
        >
          <h2 v-if="!confirmed">
            Registrieren
          </h2>
          <v-form
            v-if="!confirmed"
            ref="form"
            v-model="valid"
            fast-fail
            @submit.prevent
            class="mt-6"
          >
            <v-text-field
              v-model="name"
              density="compact"
              label="Vollständiger Name"
              prepend-inner-icon="mdi-account-outline"
              variant="outlined"
              color="primary"
              required
              autofocus
              :rules="nameRules"
              class="pb-2"
            ></v-text-field>

            <v-text-field
              v-model="email"
              density="compact"
              placeholder="E-Mail"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              color="primary"
              required
              :rules="emailRules"
              class="pb-2"
            ></v-text-field>

            <v-text-field
              v-model="password"
              :append-inner-icon="pwVisible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="pwVisible ? 'text' : 'password'"
              density="compact"
              placeholder="Passwort"
              prepend-inner-icon="mdi-lock-outline"
              variant="outlined"
              color="primary"
              counter
              autocomplete="new-password"
              required
              :rules="pwRules"
              @click:append-inner="pwVisible = !pwVisible"
              class="pb-2"
            ></v-text-field>

            <v-text-field
              v-model="password2"
              :append-inner-icon="pwVisible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="pwVisible ? 'text' : 'password'"
              density="compact"
              placeholder="Passwort"
              prepend-inner-icon="mdi-lock-outline"
              variant="outlined"
              color="primary"
              counter
              autocomplete="new-password"
              required
              :rules="pw2Rules"
              @click:append-inner="pwVisible = !pwVisible"
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
              @click="onSignUp"
            >
              Registrieren
            </v-btn>
          </v-form>

          <template v-else>
          <div class="px-0">
            <v-icon size="64" class="mb-4" color="green">
              mdi-check-circle-outline
            </v-icon>
            <h5 class="text-h5 font-weight-bold mb-4">
              Erfolgreich registriert!
            </h5>
            <p>
              Bitte überprüfe Deine E-Mails, um die Registrierung abzuschließen.
            </p>
          </div>
        </template>

        </v-card>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
  import { ref } from 'vue'
  import { signUp } from '@/plugins/supabase'

  const form = ref(null)
  const valid = ref(false)
  const loading = ref(false)

  const pwVisible = ref(false)

  const name = ref('')
  const email = ref('')
  const password = ref('')
  const password2 = ref('')

  const confirmed = ref(false)

  const nameRules = ref([
      value => {
        if (value) return true
        return 'Bitte gib deinen vollständigen Namen an.'
      },
      value => {
        if (
          value?.length > 6 &&
          value?.includes(' ') &&
          value?.split(' ')[0].length > 2 &&
          value?.split(' ')[1].length > 2
        ) return true
        return 'Dein Name scheint nicht vollständig zu sein.'
      },
  ])

  const emailRules = ref([
    value => {
      if (value) return true
      return 'Bitte gib eine Mail-Adresse an.'
    },
    value => {
      if (/.+@stamm-silberfuechse.de/.test(value)) return true
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
      return 'Bitte nutze mindestens 10 Zeichen für dein Passwort.'
    },
  ])

  const pw2Rules = ref([
    value => {
      if (value) return true
      return 'Bitte gib das Passwort noch einmal an.'
    },
    value => {
      if (value === password.value) return true
      return 'Dein Passwort stimmt nicht mit dem ersten überein.'
    },
  ])

  const onSignUp = async () => {
    loading.value = true
    const result = await signUp(email.value, password.value, name.value)
    if(result !== null) {
      confirmed.value = true
    }
    loading.value = false
  }
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Borel&family=Quicksand:wght@300;400;500;600;700&display=swap');

.sms-title {
  font-family: 'Quicksand', sans-serif !important;
}
</style>
