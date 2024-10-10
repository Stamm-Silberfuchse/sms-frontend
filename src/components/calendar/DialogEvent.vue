<template>
  <v-dialog
    v-model="props.showDialog"
    fullscreen
    :scrim="true"
    transition="dialog-bottom-transition"
  >
    <v-card :rounded="0">
      <v-form
        ref="form"
        v-model="valid"
        :loading="loading"
        lazy-validation
        @submit.prevent="saveEvent"
      >
        <v-toolbar
          dark
          color="primary"
        >
          <v-btn
            icon
            dark
            @click="emit('onClose')"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>
            {{ isNew ? 'Neuer Kalender-Eintrag' : 'Kalender-Eintrag bearbeiten' }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              variant="text"
              type="submit"
              :loading="loading"
              class="text-none"
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
                :items="eventTypes"
                item-title="text"
                label="Ereignistyp*"
                prependIcon="mdi-format-list-bulleted-square"
                :rules="typeRules"
                required
                return-object
                :disabled="!isNew"
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
            <v-col cols="12" :md="allDay ? 12 : 6">
              <v-menu v-model="menuStartDate" :close-on-content-click="false">
                <template v-slot:activator="{ props }">
                  <v-text-field
                    label="Datum (Beginn)*"
                    :model-value="formattedStartDate"
                    readonly
                    v-bind="props"
                    prependIcon="mdi-calendar"
                    :rules="startDateRules"
                  ></v-text-field>
                </template>
                <v-date-picker v-model="startDate" show-adjacent-months hide-header hide-actions @update:model-value="menuStartDate = false">
                </v-date-picker>
              </v-menu>
            </v-col>
            <v-col v-if="!allDay" cols="12" md="6">
              <v-text-field
                v-model="startTime"
                :active="menuStartTime"
                :focus="menuStartTime"
                label="Uhrzeit (Beginn)"
                :rules="startTimeRules"
                prependIcon="mdi-clock-time-four-outline"
              >
                <v-menu
                  v-model="menuStartTime"
                  :close-on-content-click="false"
                  activator="parent"
                  transition="scale-transition"
                >
                  <v-time-picker
                    v-if="menuStartTime"
                    v-model="startTime"
                    full-width
                    format="24hr"
                  ></v-time-picker>
                </v-menu>
              </v-text-field>
            </v-col>
            <v-col cols="12" :md="allDay ? 12 : 6">
              <v-menu v-model="menuEndDate" :close-on-content-click="false">
                <template v-slot:activator="{ props }">
                  <v-text-field
                    label="Datum (Ende)*"
                    :model-value="formattedEndDate"
                    readonly
                    v-bind="props"
                    prependIcon="mdi-calendar"
                    :rules="endDateRules"
                  ></v-text-field>
                </template>
                <v-date-picker v-model="endDate" show-adjacent-months hide-header hide-actions @update:model-value="menuEndDate = false">
                </v-date-picker>
              </v-menu>
            </v-col>
            <v-col v-if="!allDay" cols="12" md="6">
              <v-text-field
                v-model="endTime"
                :active="menuEndTime"
                :focus="menuEndTime"
                label="Uhrzeit (Ende)"
                :rules="endTimeRules"
                prependIcon="mdi-clock-time-four-outline"
              >
                <v-menu
                  v-model="menuEndTime"
                  :close-on-content-click="false"
                  activator="parent"
                  transition="scale-transition"
                >
                  <v-time-picker
                    v-if="menuEndTime"
                    v-model="endTime"
                    full-width
                    format="24hr"
                  ></v-time-picker>
                </v-menu>
              </v-text-field>
            </v-col>
            <v-col cols="12" class="py-0">
              <v-checkbox
                v-model="allDay"
                label="Das Event ist ganztägig"
                prependIcon="mdi-sun-clock-outline"
                required
              ></v-checkbox>
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
            <v-col cols="12" class="py-0">
              <v-checkbox
                v-model="showInCalendar"
                :label="`Im Google-Kalender anzeigen (${eventType?.description})`"
                prependIcon="mdi-eye"
              ></v-checkbox>
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="invitedGroups"
                :items="groups"
                label="Eingeladene Gruppen"
                prependIcon="mdi-account-group"
                item-title="name"
                item-value="id"
                chips
                multiple
                :item-props="true"
                @update:model-value="sortInvitedGroups($event)"
              >
                <template v-slot:chip="{ props, item }">
                  <v-chip v-bind="props" :color="item.props.color">
                    {{ item.title }}
                  </v-chip>
                </template>
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props" :title=props.titlePadded>
                    <template v-slot:prepend>
                      <v-icon>
                        {{ invitedGroups?.includes(props.id) ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}
                      </v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
            <v-col cols="12">
              <v-file-input
                v-model="attachments"
                clearable
                label="Anhänge"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-card>
    <UploadFilesDialog :active="uploadFiles" />
    <ConnectGCalendarDialog :active="connectToGCalendar" />
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format, add } from 'date-fns'
import { de } from 'date-fns/locale'
import { functions } from '@/plugins/firebase'
import { httpsCallable } from 'firebase/functions'
import { getAuth } from 'firebase/auth'
import {
  getStorage,
  ref as fbRef,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useEventsStore } from '@/store/events'
import { useGroupsStore } from '@/store/groups'

import UploadFilesDialog from '@/components/calendar/UploadFilesDialog.vue'
import ConnectGCalendarDialog from '@/components/calendar/ConnectGCalendarDialog.vue'

const emit = defineEmits(['onClose'])

const eventsStore = useEventsStore()
const groupsStore = useGroupsStore()

const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true
  },
  eventID: {
    type: [String, null],
    default: null
  }
})

const form = ref(null)
const valid = ref(false)

const loading = ref(false)
const menuStartDate = ref(false)
const menuStartTime = ref(false)
const menuEndDate = ref(false)
const menuEndTime = ref(false)

const connectToGCalendar = ref(false)
const latestSave = ref(false)

const eventTypes = [
  { text: 'Fahrt/Lager/Aktion', value: 'public', description: 'öffentlich' },
  { text: 'Intern', value: 'internal', description: 'intern' },
  { text: 'Gruppenstunde', value: 'grustu', description: 'Gruppenstunden' },
]

const eventType = ref(eventTypes[0])
const title = ref(null)
const startDate = ref(null)
const startTime = ref()
const endDate = ref(null)
const endTime = ref()
const allDay = ref(false)
const location = ref(null)
const description = ref(null)
const showInCalendar = ref(true)
const invitedGroups = ref([])
const attachments = ref([])
const gEventID = ref(null)

const uploadFiles = ref(false)
const attachmentValues = ref([])


const isNew = computed(() => props.eventID === null)

const typeRules = ref([
  value => {
    if (value !== null) return true
    return 'Bitte wähle einen Eventtyp.'
  },
])
const titleRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte gib einen Namen für die Veranstaltung an.'
  },
])
const startDateRules = ref([
  value => {
    if (value !== null && value) return true
    return 'Bitte gib ein Startdatum an.'
  },
])
const startTimeRules = ref([
  value => {
    if (allDay.value || value !== null && value) return true
    return 'Bitte gib eine Uhrzeit an.'
  },
])
const endDateRules = ref([
value => {
    if (value !== null && value) return true
    return 'Bitte gib ein Enddatum an.'
  },
])
const endTimeRules = ref([
  value => {
    if (allDay.value || value !== null && value) return true
    return 'Bitte gib eine Uhrzeit an.'
  },
])

const groups = computed(() => {
  return groupsStore.getList?.map(group => ({
    ...group,
    titlePadded: '－'.repeat(10 - group.level) + ' ' + group.name
  }))
})

const formattedStartDate = computed(() => {
  return startDate.value !== null ? format(startDate.value, 'EE dd. MMMM yyyy', { locale: de }) : ''
})
const formattedEndDate = computed(() => {
  return endDate.value !== null ? format(endDate.value, 'EE dd. MMMM yyyy', { locale: de }) : ''
})

const sortInvitedGroups = (event) => {
  let invGroups = []
  for(let i = 0; i < groups.value.length; i++) {
    if (event.includes(groups.value[i].id)) {
      invGroups.push(groups.value[i].id)
    }
  }
  invitedGroups.value = invGroups
}

const initializeForm = () => {
  eventType.value = eventTypes[0]
  title.value = 'Test-Event'
  startDate.value = new Date( (new Date())?.setHours(0, 0, 0, 0) )
  startTime.value = '10:00'
  endDate.value = new Date( (new Date())?.setHours(0, 0, 0, 0) )
  endTime.value = '12:00'
  allDay.value = false
  location.value = 'Heim'
  description.value = '-------'
  showInCalendar.value = true
  invitedGroups.value = []
  attachments.value = []
  gEventID.value = null

}

const composePayload = () => {
  let start = null
  let end = null
  if (allDay.value) {
    start = startDate.value
    end = endDate.value
  } else {
    start = add( startDate.value, {
      hours: startTime.value.split(':')[0],
      minutes: startTime.value.split(':')[1]
    } )
    end = add( endDate.value, {
      hours: endTime.value.split(':')[0],
      minutes: endTime.value.split(':')[1]
    } )
  }
  return {
    type: eventType.value,
    title: title.value,
    description: description.value,
    location: location.value,
    allDay: allDay.value,
    start: start,
    end: end,
    endTimeUnspecified: allDay.value,
    // colorId:
    source: {
      title: "SMS",
      url: import.meta.env.VITE_SITE_URL
    },
    showInCalendar: showInCalendar.value,
    invitedGroups: invitedGroups.value,
    attachments: attachmentValues.value,
    gEventID: gEventID.value,
  }
}

const uploadFile = async (file) => {
  const auth = getAuth()
  const storage = getStorage()
  let filename = file.name
  const uid = auth.currentUser.uid
  const date = format(new Date(), 'yyyy-MM-dd-HH-mm-ss')
  filename = `${date}_${uid}_${filename}`

  const metadata = {
    contentType: file.type
  }

  // Upload file and metadata to the object 'images/<filename>'
  const storageRef = fbRef(storage, 'events/' + filename)
  await uploadBytes(storageRef, file, metadata)
  const downloadURL = await getDownloadURL(storageRef)
  attachmentValues.value.push({
    fileUrl: downloadURL,
    title: filename
  })
}

const saveEvent = async () => {
  const { valid } = await form.value?.validate()
  if (!valid) {
    toast.info('Bitte überprüfe deine Angaben.')
    loading.value = false
    return
  }

  loading.value = true
  try {
    connectToGCalendar.value = true
    // upload file
    if (attachments.value?.length > 0) {
      uploadFiles.value = true
      for(let i = 0; i < attachments.value.length; i++) {
        await uploadFile(attachments.value[i])
      }
      uploadFiles.value = false
    }

    const payload = composePayload()
    if (isNew.value) {
      const createGEvent = httpsCallable(functions, 'createGEvent')
      const res = await createGEvent(payload)
      await eventsStore.addEvent({ ...payload, gEventID: res.data })
      toast.success("Event wurde gespeichert.")
    } else {
      await eventsStore.updateEvent(props.eventID, payload)
      const updateGEvent = httpsCallable(functions, 'updateGEvent')
      await updateGEvent(payload)
      toast.success("Event wurde geändert.")
    }
    emit('onClose')
    initializeForm()
    eventType.value = eventTypes[0]
    startDate.value = null
    endDate.value = null
  } catch (error) {
    toast.error("Fehler beim Speichern des Events: " + error.message)
  } finally {
      latestSave.value = true
      setTimeout(() => latestSave.value = false, 1000)
    loading.value = false
    connectToGCalendar.value = false
  }
}

watch(() => props.showDialog, () => {
  if (props.showDialog && props.eventID !== null) {
    const event = eventsStore.getByID(props.eventID)
    eventType.value = event?.type
    title.value = event?.title
    description.value = event.description
    location.value = event.location
    allDay.value = event.endTimeUnspecified
    startDate.value = new Date( event.start?.toDate()?.setHours(0, 0, 0, 0) )
    endDate.value = new Date( event.end?.toDate()?.setHours(0, 0, 0, 0) )
    if (!allDay.value) {
      startTime.value = format(event.start?.toDate(), 'HH:mm')
      endTime.value = format(event.end?.toDate(), 'HH:mm')
    }
    showInCalendar.value = event.showInCalendar
    invitedGroups.value = event.invitedGroups
    attachments.value = event.attachments
    gEventID.value = event.gEventID
  } else if (props.showDialog && props.eventID === null) {
    initializeForm()
  }
})
</script>

<style scoped>
.event-form-container {
  max-width: 600px !important;
}
</style>
