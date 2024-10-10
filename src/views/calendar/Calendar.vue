<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
        <PageTitle title="Kalender" />

        <template v-if="isAdminOrStafue">
          <v-row justify="start" class="mx-0 pt-0 px-3 pb-4">
            <v-btn
              color="primary"
              prependIcon="mdi-calendar-plus"
              class="mr-4 mb-4 text-none"
              @click="showDialogEventNew = true"
            >
              Neuer Eintrag
            </v-btn>
            <DialogEvent
              :showDialog="showDialogEventNew"
              :eventID="null"
              @onClose="showDialogEventNew = false"
            ></DialogEvent>
          </v-row>
        </template>

        <div class="mx-0 pt-0 px-3 pb-4">
          <v-tabs
            v-model="tab"
            grow
            color="primary"
            bg-color="contrastInv"
          >
            <v-tab
              v-for="item in tabs"
              :key="item.key"
              :value="item.key"
              class="text-none"
            >
              {{ item.text }}
            </v-tab>
          </v-tabs>

          <v-window v-model="tab" :touch="false">
            <v-window-item key="overview" value="overview">
              <div class="mt-6">
                <v-row justify="start" class="pb-2">
                  <template v-for="(event, index) in events" :key="event.id">
                    <v-col cols="12" sm="6" md="4">
                      <v-card
                        class="pa-0"
                        :elevation="2"
                        :loading="loadingEvents"
                        :to="{ name: 'Event', params: { id: event.id } }"
                      >
                        <v-img
                          class="align-end text-white"
                          height="220"
                          :src="event.previewImage"
                          cover
                        >
                          <v-card-title>
                            {{ event.title }}
                          </v-card-title>
                        </v-img>
                        <v-card-text>
                          <v-row class="ma-0 mt-2 text-medium-emphasis">
                            <v-col cols="auto" align-self="start" class="pa-0">
                              <v-icon small>mdi-calendar</v-icon>
                            </v-col>
                            <v-col align-self="center" class="pa-0 pl-3">
                              {{ formatDateRange(event?.start, event?.end, event?.allDay) }}
                            </v-col>
                          </v-row>
                          <v-row :class="`ma-0 mt-2 text-medium-emphasis ${event?.location?.length > 0 ? '' : 'vis-hidden'}`">
                            <v-col cols="auto" align-self="start" class="pa-0">
                              <v-icon small>mdi-map-marker-outline</v-icon>
                            </v-col>
                            <v-col align-self="center" class="pa-0 pl-3">
                              {{ event?.location }}
                            </v-col>
                          </v-row>
                        </v-card-text>
                        <v-card-actions>
                          <v-spacer />
                          <v-btn
                            color="primary"
                            text
                            @click="showDialogEventNew = true"
                          >
                            Bearbeiten
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-col>
                  </template>
                </v-row>
              </div>
            </v-window-item>
            <v-window-item key="list" value="list">
              <div class="mt-6">
                <template v-for="(event, index) in events" :key="event.id">
                  <v-divider v-if="nextEventID === event.id" :thickness="2" color="primary" class="border-opacity-100 my-4 now-timeline">
                  </v-divider>
                  <CalendarListItem :eventID="event?.id" />
                </template>
              </div>
            </v-window-item>
            <v-window-item key="calendar" value="calendar">
              <v-card :elevation="0" :loading="loadingEvents" class="w-100 pa-0 px-3 pb-3 mt-6">
                <v-sheet class="sheet">
                  <v-calendar
                    v-model="today"
                    ref="calendar"
                    color="primary"
                    type="month"
                    :events="events"
                    class="calendar"
                  ></v-calendar>
                </v-sheet>
              </v-card>
            </v-window-item>
          </v-window>
        </div>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { differenceInSeconds } from 'date-fns'
import { format, isSameDay } from 'date-fns'
import { de } from 'date-fns/locale'

import { useAuthStore } from '@/store/auth'
import { useEventsStore } from '@/store/events'

import PageTitle from '@/components/PageTitle.vue'
import DialogEvent from '@/components/calendar/DialogEvent.vue'
import CalendarListItem from '@/components/calendar/CalendarListItem.vue'

const authStore = useAuthStore()
const eventsStore = useEventsStore()

const loadingEvents = ref(false)

const showDialogEventNew = ref(false)

const calendar = ref(null)
const today = ref([new Date()])

const tabs = ref([
  { key: 'overview', text: 'Übersicht' },
  { key: 'list', text: 'Liste' },
  { key: 'calendar', text: 'Kalender'}
])

const tab = ref(tabs.value[0].key)

onMounted(async () => {
  // await eventsStore.fetchAllEvents()
  // events.value = eventsStore.events
  loadingEvents.value = true
  // await calendarStore.fetchAllEvents('5e7cde5062074a51cefeaf5c5a41eba13bbf6964f3bfedfc27d063e9f3a3c0d2@group.calendar.google.com')
  loadingEvents.value = false
})

const events = computed(() => {
  return eventsStore.getAllSortedByStart?.map((event) => {
    return {
      ...event,
      start: event.start?.toDate(),
      end: event.end?.toDate(),
      color: 'primary'
    }
  })
})
/*
const myEvent = (calendarID, event) => {
  return {
    event: event,
    id: event.id,
    title: event.summary,
    description: event.description,
    start: new Date(event.start.dateTime),
    end: new Date(event.end.dateTime),
    color: 'primary',
    allDay: event.isAllDay,
    calendarID: calendarID
  }
}
*/

const nextEventID = computed(() => {
  return eventsStore.getAllSortedByStart?.map((item) => {
    return {
      diff: differenceInSeconds(new Date(), item.start?.toDate()),
      id: item.id
    }})?.filter((item) => item.diff < 0)?.sort((a, b) => b.diff - a.diff)[0]?.id
})


const formatDateRange = (start, end, allDay) => {
  const startDate = start || new Date()
  const endDate = end || new Date()
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

const isAdminOrStafue = computed(() => {
  return authStore.isAdmin || authStore.isStafue
})
</script>

<style scoped>
.calendar, .sheet {
  width: 100%;
}

.now-timeline::before{
  content: '•';
  position: relative;
  top: -29.8px;
  font-size: 41px;
  left: -2px;
  z-index: 1;
}

.v-calendar {
  background-color: unset;
  color: unset;
}

</style>
