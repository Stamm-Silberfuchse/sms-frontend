<template>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height">
      <v-img height="200" src="@/assets/logo_weiss.svg" />

      <h1 class="text-h2 font-weight-bold mt-10 text-white sms-title">SMS - Registrieren</h1>

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

        <v-text-field
          v-model="password"
          :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
          :type="visible ? 'text' : 'password'"
          density="compact"
          placeholder="Passwort"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          color="primary"
          @click:append-inner="visible = !visible"
        ></v-text-field>

        <v-btn
          block
          class="mb-3"
          color="primary"
          size="large"
          variant="tonal"
          @click="onSignUp"
        >
          Registrieren
        </v-btn>

      </v-card>
    </v-responsive>
  </v-container>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { signUp } from '@/plugins/supabase'

  const router = useRouter()
  const route = useRoute()

  const visible = ref(false)

  const email = ref('')
  const password = ref('')

  const onSignUp = () => {
    signUp(email.value, password.value)
  }
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Borel&family=Quicksand:wght@300;400;500;600;700&display=swap');

.sms-title {
  font-family: 'Quicksand', sans-serif !important;
}
</style>
