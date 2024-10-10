<template>
  <v-container>
    <PageTitle title="Mail verfassen" :back="true" />

    <v-row justify="start" class="mx-0 pt-0 px-3 pb-4">
      <v-btn
        color="primary"
        prepend-icon="mdi-send-outline"
        :loading="sendLoading"
        :disabled="isDisabled"
        class="mr-4 mb-4 text-none"
        @click="onSendMail()"
      >
        Zur Freigabe senden
      </v-btn>
      <v-btn
        prepend-icon="mdi-content-save-outline"
        :loading="saveLoading"
        :disabled="isDisabled"
        class="mr-4 mb-4 text-none"
        @click="onSaveMail()"
      >
        Als Entwurf speichern
      </v-btn>
      <v-btn
        prepend-icon="mdi-eye-outline"
        class="mr-4 mb-4 text-none"
        @click="showPreview = true"
      >
        Vorschau
      </v-btn>
      <v-btn
        prepend-icon="mdi-view-list-outline"
        :disabled="isDisabled"
        class="mr-4 mb-4 text-none"
        @click="showRecipientsDialog = true"
      >
        Empfängerliste
      </v-btn>
    </v-row>

    <v-row
      v-if="!loading"
      justify="start"
      class="mx-0 mt-0 mb-4 pt-4"
    >
      <v-col cols="12" class="pt-0">
        <v-form>
          <v-row class="mx-0">
            <v-col align-self="center" class="pa-0">
              <v-select
                name="recipients"
                v-model="recipientGroups"
                :items="groups"
                label="An (Gruppen)"
                item-title="name"
                item-value="id"
                chips
                multiple
                variant="solo"
                :item-props="true"
                @update:model-value="sortRecipientGroups($event)"
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
                        {{ recipientGroups?.includes(props.id) ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}
                      </v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
            <v-col cols="auto" align-self="center" class="pa-0">
              <v-btn
                icon
                variant="plain"
                class="ml-2 mb-5"
                @click="showMoreRecipients = !showMoreRecipients"
              >
                <v-icon>
                  {{ showMoreRecipients ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>

          <v-expand-transition>
            <v-row v-show="showMoreRecipients" class="mx-n3">
              <v-col cols="12" md="6" lg="4" align-self="center" class="py-0">
                <v-select
                  name="recipientEvents"
                  v-model="recipientEvents"
                  :items="events"
                  label="+ An (Fahrten-TN)"
                  item-value="id"
                  chips
                  multiple
                  variant="solo"
                  :item-props="true"
                  @update:model-value="sortRecipientEvents($event)"
                >
                  <template v-slot:chip="{ props, item }">
                    <v-chip v-bind="props" :color="item.props.color">
                      {{ item.title }}
                    </v-chip>
                  </template>
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props" :title="props.title" :subtitle="dateIntervalFormat(item.raw.start.toDate(), item.raw.end.toDate())">
                      <template v-slot:prepend>
                        <v-icon>
                          {{ recipientEvents?.includes(props.id) ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}
                        </v-icon>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12" md="6" lg="4" align-self="center" class="py-0">
                <v-autocomplete
                  v-model="recipientMembers"
                  :items="members"
                  item-value="id"
                  label="+ An (Mitglieder)"
                  variant="solo"
                  chips
                  closable-chips
                  multiple
                >
                  <template v-slot:chip="{ props, item }">
                    <v-chip
                      v-bind="props"
                      label
                      :prepend-avatar="item.raw.PHOTO_URL"
                    >
                      {{ item.raw.FIRST_NAME }} {{ item.raw.LAST_NAME }}
                    </v-chip>
                  </template>

                  <template v-slot:item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      :prepend-avatar="item.raw.PHOTO_URL"
                      :title="false"
                    >
                      <v-list-item-title>
                        {{ item.raw.FIRST_NAME }} {{ item.raw.LAST_NAME }}
                      </v-list-item-title>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>
          </v-expand-transition>

          <v-text-field
            name="subject"
            v-model="subject"
            label="Betreff"
            variant="solo"
            class="mt-3"
          >
          </v-text-field>

          <Editor :init="tinyMCEOptions" :api-key="tinyMCEAPIKey" v-model="body" />

          <v-divider v-if="uploadedFiles?.length > 0" class="mt-2"></v-divider>
          <v-list v-if="uploadedFiles?.length > 0" class="w-100" lines="two">
            <v-list-item
              v-for="file in uploadedFiles"
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
              <v-list-item-subtitle>
                Erfolgreich hochgeladen.
              </v-list-item-subtitle>
            </template>
            <template v-slot:append>
              <v-btn icon variant="text" size="small" @click.stop="removeFile(file?.name)">
                <v-icon size="default">
                  mdi-close-circle
                </v-icon>
              </v-btn>
            </template>
            </v-list-item>
          </v-list>
          <v-divider v-if="uploadedFiles?.length > 0" class="mb-10"></v-divider>
          <v-row justify="center" class="mt-6">
            <v-btn
              border
              prepend-icon="mdi-paperclip"
              variant="outlined"
              class="mx-auto mb-8 text-none"
              @click="showUploadDialog = true"
            >
              {{ uploadedFiles?.length > 0 ? 'weitere' : '' }} Anhänge
            </v-btn>
          </v-row>
        </v-form>
      </v-col>
    </v-row>

    <PreviewEmail
      :show="showPreview"
      :mail="mailObject"
      :body="body"
      @close="showPreview = false"
    />

    <UploadForm
      :showDialog="showUploadDialog"
      uploadDirectory="email-attachments"
      @onCloseDialog="onCloseDialog"
      @onFinalize="onFinalizedUpload"
    />

    <DialogShowRecipients
      :showDialog="showRecipientsDialog"
      :groups="recipientGroups"
      :events="recipientEvents"
      :members="recipientMembers"
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
import { useTheme } from 'vuetify'

import { useMailsStore } from '@/store/mails'
import { useGroupsStore } from '@/store/groups'
import { useEventsStore } from '@/store/events'
import { useMembersStore } from '@/store/members'

import PageTitle from '@/components/PageTitle.vue'
import UploadForm from '@/components/UploadForm.vue'
import DialogShowRecipients from '@/components/mails/DialogShowRecipients.vue'
import PreviewEmail from '@/components/mails/PreviewEmail.vue'

import Editor from '@tinymce/tinymce-vue'

const route = useRoute()
const router = useRouter()

const createConfirm = useConfirm()

const theme = useTheme()

const mailsStore = useMailsStore()
const groupsStore = useGroupsStore()
const eventsStore = useEventsStore()
const membersStore = useMembersStore()

const loading = ref(false)
const sendLoading = ref(false)
const saveLoading = ref(false)

const recipientGroups = ref([])
const showMoreRecipients = ref(false)
const recipientEvents = ref([])
const recipientMembers = ref([])
const subject = ref('')
const body = ref('')
const uploadedFiles = ref([])

const showUploadDialog = ref(false)
const showRecipientsDialog = ref(false)

const showPreview = ref(false)

const groups = computed(() => {
  return groupsStore.getList?.map(group => ({
    ...group,
    titlePadded: '－'.repeat(10 - group.level) + ' ' + group.name
  }))
})

const isExistingMail = computed(() => route.params.id !== '' && route.params?.id !== undefined)

onMounted(async () => {
  await membersStore.fetchAll()
  if (isExistingMail.value) {
    // populate
    await mailsStore.fetchByID(route.params.id)
    const mailData = mailsStore.getByID(route.params.id)
    recipientGroups.value = mailData.recipientGroups
    showMoreRecipients.value = mailData.showMoreRecipients
    recipientEvents.value = mailData.recipientEvents
    recipientMembers.value = mailData.recipientMembers
    subject.value = mailData.subject
    body.value = mailData.body
    uploadedFiles.value = mailData.uploadedFiles
  }
})

const events = computed(() => eventsStore.getAllSortedByStart)

const members = computed(() => membersStore.getAll)

const onSendMail = async () => {
  const isConfirmed = await createConfirm({
    title: 'Mail versenden',
    content: 'Bist Du sicher? Die Mail wird zur Freigabe gesendet.'
  })
  if (!isConfirmed) return
  sendLoading.value = true
  let payload = mailObject.value
  payload.status = 'pending'  // draft, pending, sending, sent, archived
  if (isExistingMail.value) {
    await mailsStore.updateMail(route.params.id, payload)
  } else {
    await mailsStore.addMail(payload)
  }
  sendLoading.value = false
  toast.success('Mail zur Freigabe gesendet')
  router.push({ name: 'Mails' })
}

const mailObject = computed(() => {
  return {
    recipientGroups: recipientGroups.value,
    showMoreRecipients: showMoreRecipients.value,
    recipientEvents: recipientEvents.value,
    recipientMembers: recipientMembers.value,
    subject: subject.value,
    body: body.value,
    uploadedFiles: uploadedFiles.value
  }
})

const onSaveMail = async () => {
  saveLoading.value = true
  let payload = mailObject.value
  payload.status = 'draft'  // draft, pending, sending, sent, archived
  if (isExistingMail.value) {
    await mailsStore.updateMail(route.params.id, payload)
  } else {
    await mailsStore.addMail(payload)
  }
  saveLoading.value = false
  toast.success('Mail gespeichert')
  router.push({ name: 'Mails' })
}

const sortRecipientGroups = (event) => {
  let myGroups = []
  for(let i = 0; i < groups.value.length; i++) {
    if (event.includes(groups.value[i].id)) {
      myGroups.push(groups.value[i].id)
    }
  }
  recipientGroups.value = myGroups
}

const sortRecipientEvents = (event) => {
  let myEvents = []
  for(let i = 0; i < events.value.length; i++) {
    if (event.includes(events.value[i].id)) {
      myEvents.push(events.value[i].id)
    }
  }
  recipientEvents.value = myEvents
}

const onCloseDialog = () => {
  showUploadDialog.value = false
}

const onFinalizedUpload = (files) => {
  files.forEach(file => {
    uploadedFiles.value.push(file)
  })
}

const removeFile = (fileName) => {
  uploadedFiles.value = uploadedFiles.value.filter(file => file?.name !== fileName)
}

const tiny_media_upload_handler = (blobInfo, progress) => {
  return new Promise((resolve, reject) => {
    const file = blobInfo.blob()
    const auth = getAuth()
    const storage = getStorage()
    let filename = file.name
    const uid = auth.currentUser.uid
    const date = format(new Date(), 'yyyy-MM-dd-HH-mm-ss')
    filename = `${date}_${uid}_${filename}`

    const metadata = {
      contentType: file.type
    };

    // Upload file and metadata to the object 'images/mountains.jpg'
    const storageRef = fbRef(storage, 'tinyMCE/' + filename);

    resolve(uploadBytes(storageRef, blobInfo.blob(), metadata)
      .then((snapshot) => {
        return getDownloadURL(snapshot.ref)
      })
    )
  })
}

const tinyMCEAPIKey = import.meta.env.VITE_TINY_MCE_API_KEY
const tinyMCEOptions = {
  language: "de",
  skin: theme.global.name.value.includes('dark') ? "oxide-dark" : "oxide",
  content_css: theme.global.name.value.includes('dark') ? "dark" : 'light',
  plugins: "advlist link image lists media table",
  menubar: 'edit  insert format',
  toolbar: [ 'bold italic underline strikethrough subscript superscript | alignleft aligncenter alignright alignjustify' ],
  paste_data_images: false,
  images_upload_handler: tiny_media_upload_handler,
}
</script>

<style scoped>
.link_no_style {
  text-decoration: none;
  color: inherit;
}
</style>
