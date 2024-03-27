<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    :scrim="true"
    transition="dialog-bottom-transition"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        color="primary"
        prependIcon="mdi-calendar-plus"
        class="mr-4 mb-4 text-none"
      >
        Neuer Eintrag
      </v-btn>
    </template>
    <v-card :rounded="0">
      <v-form
        ref="form"
        v-model="valid"
        :loading="loading"
        lazy-validation
        @submit.prevent
      >
        <v-toolbar
          dark
          color="primary"
        >
          <v-btn
            icon
            dark
            @click="dialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Neuer Kalender-Eintrag</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              variant="text text-none"
              type="submit"
              @click.prevent="saveEvent"
            >
              Speichern
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-container class="event-form-container pa-4">
          <v-row class="mt-4">
            <v-col cols="12">
              <v-select
                v-model="eventType"
                :items="['Fahrt/Lager/Aktion', 'Intern', 'Gruppenstunde']"
                label="Ereignistyp*"
                prependIcon="mdi-format-list-bulleted-square"
                :rules="typeRules"
                required
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="title"
                label="Titel*"
                prependIcon="mdi-text"
                :rules="titleRules"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="startDate"
                label="Datum (Beginn)*"
                type="date"
                prependIcon="mdi-calendar"
                :rules="startDateRules"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="startTime"
                label="Uhrzeit (Beginn)"
                type="time"
                prependIcon="mdi-clock-time-four-outline"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="endDate"
                label="Datum (Ende)*"
                type="date"
                prependIcon="mdi-calendar"
                :rules="endDateRules"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="endTime"
                label="Uhrzeit (Ende)"
                type="time"
                prependIcon="mdi-clock-time-four-outline"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="location"
                label="Ort"
                prependIcon="mdi-map-marker"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="description"
                label="Beschreibung"
                prependIcon="mdi-text-long"
                type=""
              ></v-textarea>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useEventsStore } from '@/store/events'

const eventsStore = useEventsStore()

const form = ref(null)
const valid = ref(false)

const dialog = ref(false)

const eventType = ref('')
const title = ref('')
const startDate = ref('')
const startTime = ref('')
const endDate = ref('')
const endTime = ref('')
const location = ref('')
const description = ref('')

const typeRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte wähle einen Eventtyp.'
  },
])
const titleRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte gib einen Titel an.'
  },
])
const startDateRules = ref([
  value => {
    if (value && value.length === 10) return true
    return 'Bitte gib Startdatum an.'
  },
])
const endDateRules = ref([
value => {
    if (value && value.length === 10) return true
    return 'Bitte gib Enddatum an.'
  },
])

const saveEvent = async () => {
  const doc = await eventsStore.addEvent({
    type: eventType.value,
    title: title.value,
    startDate: startDate.value,
    startTime: startTime.value,
    endDate: endDate.value,
    endTime: endTime.value,
    location: location.value,
    description: description.value,
  })
    .catch((error) => {
      toast.error("Fehler beim Speichern des Events: " + error.message)
    })
  toast.success(`${doc.title} wurde gespeichert.`)
  dialog.value = false
}

</script>

<style scoped>
.event-form-container {
  max-width: 600px !important;
}
</style>
