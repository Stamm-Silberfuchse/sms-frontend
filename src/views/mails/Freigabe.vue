<template>
  <v-container>
    <PageTitle title="Mail freigeben" :back="true" />

    <v-row justify="start" class="mx-0 pt-0 px-1 pb-4 ">
      <v-col cols="auto" align-self="center" class="pa-2">
        <v-btn
          color="success"
          prepend-icon="mdi-check"
          :loading="loadingSend"
          class="text-none"
          @click="onConfirmMail()"
        >
          Senden
        </v-btn>
      </v-col>
      <v-col cols="auto" align-self="center" class="pa-2">
        <v-btn
          color="error"
          prepend-icon="mdi-close"
          :loading="loadingDecline"
          class="text-none"
          @click="onDeclineMail()"
        >
          Ablehnen
        </v-btn>
      </v-col>
      <v-col cols="auto" align-self="center" class="pa-2">
        <v-btn
          prepend-icon="mdi-view-list-outline"
          class="text-none"
          @click="showRecipientsDialog = true"
        >
          Empfängerliste
        </v-btn>
      </v-col>
    </v-row>

    <v-row
      v-if="!loading"
      justify="start"
      class="mx-0 mt-0 mb-4 pt-4"
    >
      <v-col cols="12" class="pt-0">
        <v-card
          class="w-100 pt-1"
          subtitle="Erstellt von:"
        >
          <v-card-text>
            <v-chip>
              <template v-slot:prepend>
                <v-avatar color="primary" class="ml-n2 mr-2">
                  <v-img
                    v-if="creator?.photoURL?.length > 0"
                    :src="creator?.photoURL"
                    :alt="creator?.name"
                    :aspect-ratio="1"
                    cover
                  ></v-img>
                  <span v-else class="font-Quicksand">
                    {{ getInitials(creator?.name) }}
                  </span>
                </v-avatar>
              </template>
              {{ creator?.name }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" class="pt-0">
        <v-card
          class="w-100 pt-1"
          subtitle="An (Gruppen):"
        >
          <v-card-text>
            <template v-for="(groupID, idx) in mail?.recipientGroups" :key="groupID">
              <v-chip
                class="mr-2"
                :color="getGroup(groupID)?.color"
              >
                {{ getGroup(groupID)?.name }}
              </v-chip>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col v-if="mail?.recipientEvents?.length > 0" cols="12" class="pt-0">
        <v-card
          class="w-100 pt-1"
          subtitle="An (Events):"
        >
          <v-card-text>
            <template v-for="(eventID, idx) in mail?.recipientEvents" :key="eventID">
              <v-chip
                class="mr-2"
                color="primary"
              >
                {{ getEvent(eventID)?.title }}
              </v-chip>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col v-if="mail?.recipientMembers ?.length > 0" cols="12" class="pt-0">
        <v-card
          class="w-100 pt-1"
          subtitle="An (Mitglieder):"
        >
          <v-card-text>
            <template v-for="(memberID, idx) in mail?.recipientMembers" :key="memberID">
              <v-chip
                class="mr-2"
                color="primary"
              >
              <template v-slot:prepend>
                <v-avatar class="ml-n2 mr-2">
                  <v-img
                    :src="getMember(memberID)?.PHOTO_URL"
                    :alt="getMember(memberID)?.FIRST_NAME"
                    :aspect-ratio="1"
                    cover
                  ></v-img>
                </v-avatar>
              </template>
                {{ getMember(memberID)?.FIRST_NAME }} {{ getMember(memberID)?.LAST_NAME }}
              </v-chip>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" class="pt-0">
        <v-card
          class="w-100 pt-1"
        >
          <v-card-item class="pb-0">
            <v-card-subtitle>
              Betreff:
            </v-card-subtitle>
          </v-card-item>
          <v-card-title class="pt-1 pb-4">
            {{ mail?.subject }}
          </v-card-title>
        </v-card>
      </v-col>
      <v-col cols="12" class="pt-0">
        <v-card
          class="w-100"
        >
          <div v-html="mjmlBody"></div>
        </v-card>
      </v-col>
      <v-col cols="12" class="pt-0">
        <v-card subtitle="Anhänge:" class="w-100 pt-1">
          <v-list v-if="mail?.uploadedFiles?.length > 0" class="w-100" lines="two">
            <v-list-item
              v-for="file in mail?.uploadedFiles"
              :key="file?.name"
              class="pl-6 py-2 w-100"
            >
            <template v-slot:prepend>
              <v-icon
                icon="mdi-file-check-outline"
                variant="text"
              ></v-icon>
            </template>
            <template v-slot:default>
              <a :href="file?.url" target="_blank" class="link_no_style">
                {{ file?.name }}
              </a>
            </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <DialogShowRecipients
      :showDialog="showRecipientsDialog"
      :groups="mail?.recipientGroups"
      :events="mail?.recipientEvents"
      :members="mail?.recipientMembers"
      @onClose="showRecipientsDialog = false"
    />
  </v-container>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useConfirm } from 'vuetify-use-dialog'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { format } from 'date-fns'
import { getAuth } from 'firebase/auth'
import { getStorage, ref as fbRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { dateIntervalFormat } from '@/plugins/sms-helper'
import { emailTemplate } from '@/plugins/sms-helper'
import mjml2html from 'mjml-browser'
import { useTheme } from 'vuetify'
import { functions } from '@/plugins/firebase'
import { httpsCallable } from 'firebase/functions'

import { useMailsStore } from '@/store/mails'
import { useGroupsStore } from '@/store/groups'
import { useEventsStore } from '@/store/events'
import { useMembersStore } from '@/store/members'
import { useUsersStore } from '@/store/users'
import { useRelGroupsMembersStore } from '@/store/rel_groups_members'

import PageTitle from '@/components/PageTitle.vue'
import DialogShowRecipients from '@/components/mails/DialogShowRecipients.vue'

const mjmlBody = computed(() => {
  let a = mjml2html(emailTemplate(mail.value?.body))
  return a.html
})

const route = useRoute()
const router = useRouter()

const createConfirm = useConfirm()

const mailsStore = useMailsStore()
const groupsStore = useGroupsStore()
const eventsStore = useEventsStore()
const membersStore = useMembersStore()
const usersStore = useUsersStore()
const relGroupsMembersStore = useRelGroupsMembersStore()

const loading = ref(false)
const loadingDecline = ref(false)
const loadingSend = ref(false)
const showRecipientsDialog = ref(false)

const getInitials = (full_name) => {
  if(full_name == null) return ''
  return full_name.split(' ').map(n => n[0]).join('')
}

const mail = computed(() => {
  return mailsStore.getByID(route.params.id)
})

const getGroup = (groupID) => {
  return groupsStore.getByID(groupID)
}

const getEvent = (eventID => eventsStore.getByID(eventID))

const getMember = (memberID => membersStore.getByID(memberID))

const creator = computed(() => usersStore.getByID(mail.value?.createdUserID))

const onConfirmMail = async () => {
  const isConfirmed = await createConfirm({
    title: 'Mail freigeben',
    text: 'Möchtest du die Mail wirklich absenden?'
  })
  if (!isConfirmed) return
  loadingSend.value = true
  const sendNewsletter = httpsCallable(functions, 'sendNewsletter')
  try {
    const payload = {
      mailID: route.params.id,
      recipientMemberIDs: sanitizedRecipients.value,
      bodyMJML: emailTemplate(mail.value?.body)
    }
    await sendNewsletter(payload)
    await mailsStore.updateMail(route.params.id, { status: 'sent' })
    router.push({ name: 'Admin'})
    toast.success("Mail wurde erfolgreich versendet.")
  } catch (error) {
    toast.error("Fehler beim Versenden der Mail.")
  } finally {
    loadingSend.value = false
  }
}

const onDeclineMail = async () => {
  const isConfirmed = await createConfirm({
    title: 'Mail nicht senden',
    text: 'Möchtest du die Mail wirklich ablehnen? Sie wird dann wieder als Entwurf gespeichert.'
  })
  if (!isConfirmed) return
  loadingDecline.value = true
  const payload = { status: 'draft' }
  await mailsStore.updateMail(route.params.id, payload)
  loadingDecline.value = false
  toast.success('Mail wurde abgelehnt und als Entwurf gespeichert.')
  router.push({ name: 'Admin'})
}

onMounted(() => {
  membersStore.fetchAll()
  mailsStore.fetchByID(route.params.id)
})

const sanitizedRecipients = computed(() => {
  let recipientIDs = []
  // add by group
  for (const groupID of mail.value?.recipientGroups) {
    const rels = relGroupsMembersStore.getByGroupID(groupID)
    recipientIDs = recipientIDs.concat(rels?.map(rel => rel.memberID))
    }
  // add by members
  recipientIDs = recipientIDs.concat(mail.value?.recipientMembers)
  // remove duplicates
  recipientIDs = [...new Set(recipientIDs)]
  return recipientIDs
})
</script>

<style scoped>
.link_no_style {
  text-decoration: none;
  color: inherit;
}
</style>
