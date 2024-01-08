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
        <v-form>
          <v-select
            name="recipients"
            v-model="recipients"
            label="Empfänger"
            variant="solo"
            multiple
            :items="recipientsOptions"
            item-title="title"
            item-value="id"
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
            v-model="individualRecipients"
            :items="[]"
            label="weitere Empfänger*innen"
            variant="solo"
            multiple
            chips
          >
          </v-combobox>

          <v-text-field
            name="subject"
            v-model="subject"
            label="Betreff"
            variant="solo"
          >
          </v-text-field>

          <v-textarea
            name="body"
            v-model="body"
            variant="solo"
            label="Inhalt"
            auto-grow
          ></v-textarea>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useConfirm } from 'vuetify-use-dialog'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useMailsStore } from '@/store/mails'

import PageTitle from '@/components/PageTitle.vue'

const router = useRouter()

const createConfirm = useConfirm()

const mailsStore = useMailsStore()

const loading = ref(false)
const sendLoading = ref(false)
const saveLoading = ref(false)

const recipients = ref([])
const individualRecipients = ref([])
const recipientsOptions = ref([])
const subject = ref('')
const body = ref('')

const showIndividualRecipients = computed(() => {
  return recipients.value.some(el => {
    return el === 5
  })
})

const onSendMail = async () => {
  const isConfirmed = await createConfirm({
    title: 'Mail versenden',
    content: 'Bist Du sicher?',
    confirmationText: 'Ja',
    cancellationText: 'Nein',
    cardProps: {
      maxWidth: 400,
      class: "mx-auto w-100"
    }
  })
  if (!isConfirmed) return
  sendLoading.value = true
  const payload = {
    status: 'pending',
    recipients: recipients.value,
    subject: subject.value,
    body: body.value,
  }
  await mailsStore.addMail(payload)
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
