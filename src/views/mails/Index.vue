<template>
  <v-container>
    <PageTitle title="Mails" />

    <v-row class="mt-0 mx-0 px-3 pt-4">
      <v-slide-y-transition
        class="py-0"
        group
      >
        <template v-for="(email, i) in mails" :key="`${email.id}`">
          <v-card
            width="100%"
            class="mb-1 pa-4"
            @click="previewMail = email; showPreview = true"
          >
            <v-row justify="start">
              <v-col cols="auto">
                <Avatar :userID="email.createdUserID" :tooltip="true" tooltip-prepend="erstellt von:" />
              </v-col>
              <v-col align-self="center">
                <v-card-item
                  :title="email.subject"
                  class="pa-0 mail-title"
                >
                  <v-card-subtitle class="pb-0">
                    <span>
                      {{ fdate(email.createdTimestamp) }}
                    </span>
                  </v-card-subtitle>
                  <v-chip
                    v-if="email.uploadedFiles?.length > 0"
                    label
                    density="compact"
                    prepend-icon="mdi-paperclip"
                    class="mt-2"
                  >
                    {{ email.uploadedFiles?.length }} Anhänge
                  </v-chip>
                </v-card-item>
              </v-col>
              <v-col cols="auto" class="px-0" style="margin-top: 3px;">
                <StatusBadge :email="email" />
              </v-col>
              <v-col cols="auto" class="pl-0">
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-dots-vertical"
                      variant="text"
                    ></v-btn>
                  </template>
                  <v-list>
                    <v-list-item
                      title="Bearbeiten"
                      prepend-icon="mdi-pencil"
                      @click="router.push({ name: 'Mail verfassen', params: { id: email.id } })"
                    />
                    <v-list-item
                      title="Archivieren"
                      prepend-icon="mdi-archive"
                      @click="onArchiveMail(email.id)"
                    />
                    <v-list-item
                      title="Löschen"
                      prepend-icon="mdi-delete"
                      @click="onDeleteMail(email.id)"
                    />
                  </v-list>
                </v-menu>
              </v-col>
            </v-row>
          </v-card>
        </template>
      </v-slide-y-transition>
    </v-row>

    <PreviewEmail
      :show="showPreview"
      :mail="previewMail"
      @close="showPreview = false"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { useConfirm } from 'vuetify-use-dialog'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useMailsStore } from '@/store/mails'
import { useUsersStore } from '@/store/users'

import PageTitle from '@/components/PageTitle.vue'
import Avatar from '@/components/Avatar.vue'
import StatusBadge from '@/components/mails/StatusBadge.vue'
import PreviewEmail from '@/components/mails/PreviewEmail.vue'

const router = useRouter()

const createConfirm = useConfirm()

const loading = ref(true)

const previewMail = ref(null)
const showPreview = ref(false)

const showArchived = ref(false)
const loadingArchived = ref(false)

const mailsStore = useMailsStore()
const usersStore = useUsersStore()

onBeforeMount(async () => {
  loading.value = true
  const members = usersStore.getMe
  console.log(members)
  await mailsStore.fetchAll()
  loading.value = false
})

const editLists = () => {
  toast.info('Not implemented yet')
}

const goToSettings = () => {
  toast.info('Not implemented yet')
}

const mails = computed(() => {
  return mailsStore.getAllSorted?.filter(mail => {
    return showArchived.value ? true : mail.status !== 'archived'
  })
})

const onArchiveMail = async (id) => {
  const isConfirmed = await createConfirm({
    title: 'Mail archivieren',
    content: 'Bist Du sicher?'
  })
  if (!isConfirmed) return
  await mailsStore.updateMail(id, { status: 'archived' })
    .then(() => {
      toast.success('Mail archiviert')
    })
}

const onDeleteMail = async (id) => {
  if (mailsStore.getByID(id).status === 'archived') {
    toast.error('Archivierte Mails können nicht gelöscht werden')
    return
  }
  const isConfirmed = await createConfirm({
    title: 'Mail löschen',
    content: 'Bist Du sicher?'
  })
  if (!isConfirmed) return
  await mailsStore.deleteMail(id)
    .then(() => {
      toast.success('Mail gelöscht')
    })
}

const fdate = (date) => {
  if(!!date) {
    return format(date.toDate(), 'dd.MM.yyyy, HH:mm', {locale: de})
  }
  return ''
}

const onClickArchived = async () => {
  if (!loadingArchived.value) {
    loadingArchived.value = true
    mailsStore.fetchAll(true)
    loadingArchived.value = false
  }
  showArchived.value = !showArchived.value
}
</script>

<style>
.mail-title {
  margin-top: -6px;
}
</style>
