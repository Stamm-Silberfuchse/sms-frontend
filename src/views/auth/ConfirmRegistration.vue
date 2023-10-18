<template>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height mx-2">
      <div class="main-div pb-8">
        <v-img height="200" src="@/assets/logo_weiss.svg" />

        <h1 class="text-h2 font-weight-bold mt-10 text-white sms-title">SMS</h1>

        <v-card
          class="mx-auto mt-10 pa-12 pb-8"
          elevation="8"
          max-width="448"
          rounded="lg"
        >
          <div class="px-0">
            <v-icon size="64" class="mb-4" color="green">
              mdi-check-circle-outline
            </v-icon>
            <h5 class="text-h5 font-weight-bold mb-4">
              E-Mail bestätigt!
            </h5>
          </div>
        </v-card>
        <v-alert icon="mdi-alert-circle-outline" type="info" class="mt-12 text-left mx-auto" max-width="448">
          Dein Account muss nun von den Admins freigegeben werden.<br>
          Bitte habe ein bisschen Geduld.<br>
          Du bekommst eine E-Mail, sobald du auf das SMS zugreifen kannst.
        </v-alert>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
  import { ref } from 'vue'

  const loading = ref(false)

  // TODO: send notification to admins
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Borel&family=Quicksand:wght@300;400;500;600;700&display=swap');

.sms-title {
  font-family: 'Quicksand', sans-serif !important;
}
</style>
