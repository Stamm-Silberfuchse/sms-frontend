<template>
  <div class="text-center">
    <v-img height="240" :src="logoFile" />

    <div class="text-body-2 font-weight-light pt-8 mb-2">Willkommen beim</div>

    <h1 class="text-h3 font-weight-bold font-Quicksand">Silberfuchs Management System</h1>

    <div class="py-14" />

    <v-row class="d-flex align-center justify-center">
      <v-col cols="auto">
        <v-btn
          :to="{ name: 'Mails' }"
          min-width="164"
          variant="text"
          class="text-none"
        >
          <v-icon
            icon="mdi-email-outline"
            size="large"
            start
          />
          Mails
        </v-btn>
      </v-col>

      <v-col cols="auto">
        <v-btn
          min-width="164"
          variant="text"
          :to="{ name: 'Kalender' }"
          class="text-none"
        >
          <v-icon
            icon="mdi-calendar-outline"
            size="large"
            start
          />
          Kalender
        </v-btn>
      </v-col>

      <v-col cols="auto">
        <v-btn
          :to="{ name: 'Fundsachen' }"
          min-width="164"
          variant="text"
          class="text-none"
        >
          <v-icon
            icon="mdi-tag-multiple-outline"
            size="large"
            start
          />
          Fundstücke
        </v-btn>
      </v-col>

      <v-col cols="auto">
        <v-btn
          :to="{ name: 'Verwaltung' }"
          min-width="164"
          variant="text"
          class="text-none"
        >
          <v-icon
            icon="mdi-account-group-outline"
            size="large"
            start
          />
          Verwaltung
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()

const logoFile = computed(() => {
  return '/logo_rot' + (theme.global.name.value.includes('dark') ? '_light' : '') + '.svg'
})
</script>
