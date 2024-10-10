<template>
  <v-card
    width="100%"
    class="mb-3 pa-0"
  >
    <v-row justify="start" class="ma-0 pa-4 pb-0">
      <v-col align-self="center" class="pa-0">
        <v-card-item class="pa-0 mt-n1">
          <v-card-title>
            <v-row class="ma-0">
              <v-col cols="auto" align-self="center" class="pa-0">
                {{ event?.title }}
              </v-col>
              <v-col v-if="isFinished" align-self="center" class="pa-0">
                <v-chip label variant="flat" size="small" class="ml-3">
                  vorbei
                </v-chip>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text class="px-0 pb-0">
            <v-row class="ma-0 mt-2 text-medium-emphasis">
              <v-col cols="auto" align-self="start" class="pa-0">
                <v-icon small>mdi-calendar</v-icon>
              </v-col>
              <v-col align-self="center" class="pa-0 pl-3">
                {{ formatDateRange(event?.start, event?.end, event?.allDay) }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card-item>
      </v-col>
      <v-col cols="auto" class="pa-0 pl-2">
        <v-btn
          :icon="expand ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="expand = !expand"
        ></v-btn>
      </v-col>
      <v-col cols="auto" class="pa-0 pl-2">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-dots-vertical"
              variant="text"
              :loading="deleteLoading"
            ></v-btn>
          </template>
          <v-list>
            <v-list-item @click="showEventDialog = true">
              <v-list-item-title>
                Bearbeiten
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="onDeleteEvent">
              <v-list-item-title>
                Löschen
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <DialogEvent
          :showDialog="showEventDialog"
          :eventID="props.eventID"
          @onClose="showEventDialog = false"
        ></DialogEvent>
      </v-col>
    </v-row>
    <v-card-text class="pa-0 px-4 pb-4">
      <v-row v-if="event?.location?.length > 0" class="ma-0 mt-2 text-medium-emphasis">
        <v-col cols="auto" align-self="start" class="pa-0">
          <v-icon small>mdi-map-marker-outline</v-icon>
        </v-col>
        <v-col align-self="center" class="pa-0 pl-3">
          {{ event?.location }}
        </v-col>
      </v-row>
    </v-card-text>
    <v-expand-transition>
      <div v-show="expand">
        <v-divider></v-divider>

        <v-card-text class="px-4">
          <v-row v-if="event?.description?.length > 0" class="ma-0 mt-2 mb-3">
            <v-col cols="auto" align-self="start" class="pa-0">
              <v-icon small>mdi-text-long</v-icon>
            </v-col>
            <v-col align-self="center" class="pa-0 pl-3">
              <p v-html="event?.description" class="text-pre-wrap"></p>
            </v-col>
          </v-row>
          <v-row v-if="event?.invitedGroups?.length > 0" class="ma-0 mt-1">
            <v-col cols="auto" align-self="start" class="pa-0">
              <v-icon small class="pt-3">mdi-account-group-outline</v-icon>
            </v-col>
            <v-col align-self="center" class="pa-0 pl-3">
              <v-chip
                v-for="group in event?.invitedGroups"
                :key="group"
                class="ma-1"
                size="small"
                :color="groupByID(group)?.color"
              >
                {{ groupByID(group)?.name }}
              </v-chip>
            </v-col>
          </v-row>
          <v-row class="ma-0 mt-2 mb-0 text-medium-emphasis">
            <v-col cols="auto" align-self="start" class="pa-0">
              <v-icon small>mdi-information-outline</v-icon>
            </v-col>
            <v-col align-self="center" class="pa-0 pl-3">
              <v-chip label size="small" :prepend-icon="event?.showInCalendar ? 'mdi-eye' : 'mdi-eye-off-outline'" class="me-2 mb-2">
                {{ event?.showInCalendar ? 'Im Google-Kalender' : 'Nicht im Google-Kalender' }}
              </v-chip>
              <v-chip label size="small" prepend-icon="mdi-calendar-outline" class="me-2 mb-2">
                Kalender: {{ event?.type?.text }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>
      </div>
    </v-expand-transition>
    <ConnectGCalendarDialog :active="connectToGCalendar" />
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useConfirm } from 'vuetify-use-dialog'
import { format, isSameDay } from 'date-fns'
import { de } from 'date-fns/locale'
import { functions } from '@/plugins/firebase'
import { httpsCallable } from 'firebase/functions'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useEventsStore } from '@/store/events'
import { useGroupsStore } from '@/store/groups'

import DialogEvent from '@/components/calendar/DialogEvent.vue'
import ConnectGCalendarDialog from '@/components/calendar/ConnectGCalendarDialog.vue'

const createConfirm = useConfirm()

const props = defineProps({
  eventID: {
    type: String,
    required: true
  }
})

const eventsStore = useEventsStore()
const groupsStore = useGroupsStore()

const showEventDialog = ref(false)
const expand = ref(false)
const deleteLoading = ref(false)
const connectToGCalendar = ref(false)

const event = computed(() => eventsStore.getByID(props.eventID))
const groupByID = (id) => groupsStore.getByID(id)

const isFinished = computed(() => {
  const now = new Date()
  return event?.value?.end?.toDate() < now
})

const formatDateRange = (start, end, allDay) => {
  const startDate = start?.toDate() || new Date()
  const endDate = end?.toDate() || new Date()
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

const onDeleteEvent = async () => {
  const isConfirmed = await createConfirm({
    title: `Event '${event?.value?.title}' löschen`,
    content: 'Bist Du sicher?',
  })
  if (!isConfirmed) return

  try {
    deleteLoading.value = true
    connectToGCalendar.value = true
    const deleteGEvent = httpsCallable(functions, 'deleteGEvent')
    await deleteGEvent(event.value)
    await eventsStore.deleteEvent(props.eventID)
    toast.success("Kalender-Eintrag wurde gelöscht.")
  } catch (error) {
    toast.error("Fehler beim Löschen des Kalender-Eintrags: " + error.message)
  } finally {
    connectToGCalendar.value = false
    deleteLoading.value = false
  }
}

</script>
