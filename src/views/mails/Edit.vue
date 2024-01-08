<template>
  <v-container>
    <PageTitle title="Mail bearbeiten" :back="true" :loading="loading">
      <StatusBadge :email="email" size="default" tooltipLocation="end" />
    </PageTitle>

    <v-row justify="start" class="mx-0 pt-0 px-3 pb-4">
      <v-btn
        color="primary"
        prepend-icon="mdi-send-outline"
        :loading="sendLoading"
        :disabled="isDisabled"
        class="mr-4 mb-4 text-none"
        @click="onSendMail()"
      >
        Senden
      </v-btn>
      <v-btn
        prepend-icon="mdi-content-save-outline"
        :loading="saveLoading"
        :disabled="isDisabled"
        class="mr-4 mb-4 text-none"
        @click="onSaveMail()"
      >
        Speichern
      </v-btn>
    </v-row>

    <v-row
      v-if="!loading"
      justify="start"
      class="mx-0 mt-0 mb-4 pt-4"
      style="padding-left: -20px;"
    >
      <v-col cols="12" class="pt-0">
        <v-form :v-if="!loading">
          <v-select
            name="recipients"
            v-model="email.recipients"
            label="Empfänger"
            variant="solo"
            multiple
            :items="recipientsOptions"
            item-title="title"
            item-value="id"
            :disabled="isDisabled"
          >
            <template v-slot:selection="{ item, index }">
              <v-chip>
                <span>{{ item.title }}</span>
              </v-chip>
            </template>
          </v-select>

          <v-combobox
            name="individualRecipients"
            v-if="showIndividualRecipients"
            v-model="email.individualRecipients"
            :items="[]"
            label="weitere Empfänger*innen"
            variant="solo"
            multiple
            chips
            :disabled="isDisabled"
          >
          </v-combobox>

          <v-text-field
            name="subject"
            v-model="email.subject"
            label="Betreff"
            variant="solo"
            :disabled="isDisabled"
          >
          </v-text-field>

          <v-textarea
            name="body"
            v-model="email.body"
            variant="solo"
            label="Inhalt"
            auto-grow
            :disabled="isDisabled"
          ></v-textarea>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { useRouter, useRoute } from 'vue-router'

import { useMailsStore } from '@/store/mails'

import PageTitle from '@/components/PageTitle.vue'
import StatusBadge from '@/components/mails/StatusBadge.vue'

const route = useRoute()
const router = useRouter()

const mailsStore = useMailsStore()

const sendLoading = ref(false)
const saveLoading = ref(false)

const loading = ref(true)
const email = ref({})
const recipientsOptions = ref([])

onMounted(async () => {
  const id = route.params.id
  if (mailsStore.getByID(id) === undefined) {
    console.log('Loading mail')
    await mailsStore.fetchMail(id)
  }
  email.value = mailsStore.getByID(id)
  loading.value = false
})

const showIndividualRecipients = computed(() => {
  return email?.recipients?.value.some(el => {
    return el === 5
  })
})

const isDisabled = computed(() => {
  return email?.value?.status?.id === 2 ||
    email?.value?.status?.id === 3 ||
    email?.value?.status?.id === 4 ||
    email?.value?.status?.id === 5
})

const onSendMail = async () => {
  sendLoading.value = true
  const payload = {
    status: 'pending',
    recipients: email.value?.recipients,
    subject: email.value?.subject,
    body: email.value?.body,
  }
  await mailsStore.updateMail(route.params.id, payload)
  sendLoading.value = false
  toast.success('Mail zur Freigabe gesendet')
  router.push({ name: 'Mails' })
}

const onSaveMail = async () => {
  saveLoading.value = true
  const payload = {
    status: 'draft',
    recipients: recipients.value,
    subject: subject.value,
    body: body.value,
  }
  await mailsStore.addMail(payload)
  saveLoading.value = false
  toast.success('Mail gespeichert')
  router.push({ name: 'Mails' })
}
</script>
