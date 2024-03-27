<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
        <PageTitle title="Kalender" />

        <v-row justify="start" class="mx-0 pt-0 px-3 pb-4">
          <DialogNewEvent />
        </v-row>

        <v-row justify="center" class="mx-0 pt-0 px-3 pb-4">
          <v-sheet color="white" class="sheet">
            <v-calendar
              v-model="today"
              ref="calendar"
              color="primary"
              type="month"
              :events="events"
              class="calendar"
            ></v-calendar>
          </v-sheet>
        </v-row>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import { useEventsStore } from '@/store/events'

import PageTitle from '@/components/PageTitle.vue'
import DialogNewEvent from '@/components/calendar/DialogNewEvent.vue'

const eventsStore = useEventsStore()

const calendar = ref(null)
const events = ref([])
const today = ref([new Date()])

onMounted(async () => {
  await eventsStore.fetchAllEvents()
  events.value = eventsStore.events
})

</script>

<style scoped>
.calendar, .sheet {
  width: 100%;
}
</style>