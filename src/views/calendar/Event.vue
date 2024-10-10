<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
        <v-card>
          <v-img
            :src="event?.previewImage"
            cover
            style="max-height: 300px;"
          ></v-img>
          <v-card-text class="px-6 pb-6">
            <h1
              :class="`heading text-primary font-Quicksand ml-0`"
            >
              {{ event?.title }}
            </h1>
            <v-row class="ma-0 mt-4 text-medium-emphasis">
              <v-col cols="auto" align-self="start" class="pa-0">
                <v-icon small>mdi-calendar</v-icon>
              </v-col>
              <v-col align-self="center" class="pa-0 pl-3">
                {{ formatDateRange(event?.start, event?.end, event?.allDay) }}
              </v-col>
            </v-row>
            <v-row v-if="event?.location?.length > 0" class="ma-0 mt-3 text-medium-emphasis">
              <v-col cols="auto" align-self="start" class="pa-0">
                <v-icon small>mdi-map-marker-outline</v-icon>
              </v-col>
              <v-col align-self="center" class="pa-0 pl-3">
                {{ event?.location }}
              </v-col>
            </v-row>
            <v-row v-if="event?.description?.length > 0" class="ma-0 mt-3">
              <v-col cols="auto" align-self="start" class="pa-0">
                <v-icon small>mdi-text-long</v-icon>
              </v-col>
              <v-col align-self="center" class="pa-0 pl-3">
                <p v-html="event?.description" class="text-pre-wrap"></p>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { format, isSameDay } from 'date-fns'
import { de } from 'date-fns/locale'

import { useEventsStore } from '@/store/events'

const route = useRoute()

const eventsStore = useEventsStore()

const event = computed(() => {
  return eventsStore.getByID(route.params.id)
})

const formatDateRange = (start, end, allDay) => {
  const startDate = start.toDate() || new Date()
  const endDate = end.toDate() || new Date()
  if (allDay) {
    const dateFormat = 'EEEEEE, d. MMMM yyyy'
    const formattedStartDate = format(startDate, dateFormat, { locale: de })
    const formattedEndDate = isSameDay(startDate, endDate) ? '' : ' - ' + format(endDate, dateFormat, { locale: de })
    return `${formattedStartDate}${formattedEndDate}`
  } else {
    const startDateFormat = 'EEEEEE, d. MMMM yyyy HH:mm'
    const endDateFormat = isSameDay(startDate, endDate) ? 'HH:mm' : 'EEEEEE, d. MMMM yyyy HH:mm'
    const formattedStartDate = format(startDate, startDateFormat, { locale: de })
    const formattedEndDate = format(endDate, endDateFormat, { locale: de })
    return `${formattedStartDate} - ${formattedEndDate}`
  }
}


</script>
