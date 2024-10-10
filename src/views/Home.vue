<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
        <v-row justify="center" class="mx-0 px-3 mt-5 mb-0">
          <v-img height="140" :src="logoFile" />
        </v-row>

        <v-row justify="center" class="mx-0 px-3 mt-2 mb-0">
          <div class="text-center">
            <div class="text-body-1 font-weight-light pt-4 mb-2">Willkommen beim</div>
            <h1 class="text-h3 font-weight-bold font-Quicksand">Silberfuchs Management System</h1>
          </div>
        </v-row>

        <v-row justify="center" class="mx-0 px-3 mt-2 mb-0">
          <v-row class="d-flex align-center justify-center mx-0 mt-6">
            <MainCard
              title="Mails"
              icon="mdi-email-outline"
              :to="{ name: 'Mails' }"
            />
            <MainCard
              title="Kalender"
              icon="mdi-calendar-outline"
              :to="{name: 'Kalender'}"
            />
            <MainCard
              title="Fundstücke"
              icon="mdi-tag-multiple-outline"
            />
            <MainCard
              title="Verwaltung"
              icon="mdi-account-group-outline"
              :to="{ name: 'Verwaltung'}"
            />
          </v-row>
        </v-row>

        <v-row justify="start" class="mx-0 px-3 mt-8 mb-0">
          <v-col cols="12" md="6" lg="4">
            <v-card title="Anstehende Termine" :elevation="0">
              <v-row class="mx-0 mb-2">
                <template v-for="(event, index) in nextEvents" :key="event.id">
                  <v-col cols="12">
                    <v-card
                      variant="flat"
                      border
                      :title="event.title"
                      :subtitle="event.description"
                    >
                    </v-card>
                  </v-col>
                </template>
              </v-row>
            </v-card>
          </v-col>

          <v-col cols="12" md="6" lg="4">
            <v-card title="Letzte E-Mails" :elevation="0">
              <v-row class="mx-0 mb-2">
                <template v-for="(event, index) in nextEvents" :key="event.id">
                  <v-col cols="12">
                    <v-card
                      variant="flat"
                      border
                      :title="event.title"
                      :subtitle="event.description"
                    >
                    </v-card>
                  </v-col>
                </template>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from 'vuetify'

import { useEventsStore } from '@/store/events'

import PageTitle from '@/components/PageTitle.vue'
import MainCard from '@/components/MainCard.vue'

const theme = useTheme()

const eventsStore = useEventsStore()

const logoFile = computed(() => {
  return '/logo_rot' + (theme.global.name.value.includes('dark') ? '_light' : '') + '.svg'
})

const nextEvents = computed(() => {
  console.log(eventsStore.getAllSortedByStart.slice(0, 3))
  return eventsStore.getAllSortedByStart.slice(0, 3)
})

</script>
