<template>
  <v-container>
    <PageTitle title="Einstellungen" />

    <v-row justify="start" class="mx-0 pt-0 px-3 pb-3">
      <v-switch
        v-model="darkMode"
        prepend-icon="mdi-theme-light-dark"
        label="Dark Mode"
        hide-details
        class="mr-2"
        @click.prevent="switchTheme"
      />
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PageTitle from '@/components/PageTitle.vue'
import { useTheme } from 'vuetify'
import { useCookies } from "vue3-cookies"

const { cookies } = useCookies()

const theme = useTheme()

const darkMode = ref(false)

onMounted(() => {
  darkMode.value = cookies.get('themeMode') === 'darkTheme'
})

const switchTheme = () => {
  darkMode.value = !darkMode.value
  theme.global.name.value = darkMode.value ? 'darkTheme' : 'lightTheme'
  cookies.set('themeMode', theme.global.name.value)
}
</script>
