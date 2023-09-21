<template>
  <v-container>
    <PageTitle title="Mail verfassen" :back="true" />
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

      <v-row class="ma-0 justify-end">
        <v-btn class="mr-4 text-none" prepend-icon="mdi-content-save-outline" @click="saveMail">
          Speichern
        </v-btn>
        <v-btn class="text-none" color="primary" prepend-icon="mdi-send-clock-outline">
          Senden
        </v-btn>
      </v-row>

    </v-form>
  </v-container>
</template>

<script setup>
import { computed, ref, toRaw } from 'vue'
import { supabase } from '@/plugins/supabase'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import PageTitle from '@/components/PageTitle.vue'

const recipients = ref([])
const individualRecipients = ref([])
const recipientsOptions = ref([])
const subject = ref('')
const body = ref('')

supabase
  .from('email_recipient_groups')
  .select('id, title')
  .then(({ data, error, status }) => {
    if (error && status !== 406) throw error

    if(data) {
      recipientsOptions.value = data
    }
  })
  .catch((error) => {
    toast.error(error.message)
  })

const showIndividualRecipients = computed(() => {
  return recipients.value.some(el => {
    return el === 5
  })
})

const saveMail = async () => {
  console.log({
    status: 0,
    recipients: recipients.value,
    subject: subject.value,
    body: body.value,
  })
  supabase
    .from('emails')
    .insert([
      {
        status: 0,
        recipients: recipients.value,
        subject: subject.value,
        body: body.value,
      },
    ])
    .select()
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error

      if(data) {
        toast.success("Entwurf gespeichert.")
      }
    })
    .catch((error) => {
      console.log(error)
      toast.error(error.message)
    })



}
</script>
