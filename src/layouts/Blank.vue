<template>
  <v-app theme="">
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { useTheme } from 'vuetify'

const theme = useTheme()
theme.global.name.value = 'blankTheme'
</script>
