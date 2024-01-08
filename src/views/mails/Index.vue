<template>
  <v-container>
    <PageTitle title="Mails" />

    <v-row justify="start" class="mx-0 pt-0 px-3 pb-4">
      <v-btn
        color="primary"
        prependIcon="mdi-email-edit-outline"
        class="mr-4 mb-4 text-none"
        :to="{ name: 'Mail verfassen' }"
      >
        Verfassen
      </v-btn>
      <v-btn
        @click="editLists"
        prependIcon="mdi-playlist-edit"
        class="mr-4 mb-4 text-none"
      >
        Verteiler bearbeiten
      </v-btn>
      <v-btn
        @click="goToSettings"
        prependIcon="mdi-cog-outline"
        class="mr-4 mb-4 text-none"
      >
        Einstellungen
      </v-btn>
    </v-row>

    <v-row class="mt-0 mx-0 px-3 pt-4">
      <v-slide-y-transition
        class="py-0"
        group
      >
        <template v-for="(email, i) in mails" :key="`${email.id}`">
          <v-card
            width="100%"
            class="mb-1 pa-4"
            @click="router.push({ name: 'Mail bearbeiten', params: { id: email.id } })"
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
                </v-card-item>
              </v-col>
              <v-col cols="auto" class="px-0" align-self="center">
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
                    <v-list-item>
                      <v-list-item-title>
                        Bearbeiten
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="onArchiveMail(email.id)">
                      <v-list-item-title>
                        Archivieren
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="onDeleteMail(email.id)">
                      <v-list-item-title>
                        Löschen
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-col>
            </v-row>
          </v-card>
        </template>
      </v-slide-y-transition>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { useConfirm } from 'vuetify-use-dialog'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useMailsStore } from '@/store/mails'

import PageTitle from '@/components/PageTitle.vue'
import Avatar from '@/components/Avatar.vue'
import StatusBadge from '@/components/mails/StatusBadge.vue'

const router = useRouter()

const createConfirm = useConfirm()

const loading = ref(true)

const mailsStore = useMailsStore()

onMounted(async () => {
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
  return mailsStore.getAllSorted
})

const onArchiveMail = async (id) => {
  const isConfirmed = await createConfirm({
    title: 'Mail archivieren',
    content: 'Bist Du sicher?',
    confirmationText: 'Ja',
    cancellationText: 'Nein',
    cardProps: {
      maxWidth: 400,
      class: "mx-auto w-100"
    }
  })
  if (!isConfirmed) return
  toast.info('Not implemented yet')
}

const onDeleteMail = async (id) => {
  const isConfirmed = await createConfirm({
    title: 'Mail löschen',
    content: 'Bist Du sicher?',
    confirmationText: 'Ja',
    cancellationText: 'Nein',
    cardProps: {
      maxWidth: 400,
      class: "mx-auto w-100"
    }
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
</script>

<style>
.mail-title {
  margin-top: -6px;
}
</style>
