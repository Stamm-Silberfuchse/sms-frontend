<template>
  <v-container>
    <PageTitle title="Mail bearbeiten" :back="true">
      <v-chip
        :v-if="!loading"
        class="ma-2"
        variant="flat"
        :color="email?.status?.color"
        :prepend-icon="email?.status?.mdi_icon"
      >
        {{ email?.status?.display_name }}
      </v-chip>
    </PageTitle>
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

      <v-row class="ma-0 justify-end">
        <v-btn
          class="mr-4 text-none"
          prepend-icon="mdi-content-save-outline"
          @click="saveMail"
          :disabled="isDisabled"
        >
          Speichern
        </v-btn>
        <v-btn
          class="text-none"
          color="primary"
          prepend-icon="mdi-send-clock-outline"
          :disabled="isDisabled"
        >
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
import { useRoute } from 'vue-router'

import PageTitle from '@/components/PageTitle.vue'

const $route = useRoute()

const email = ref({})
const recipientsOptions = ref([])
const loading = ref(true)

supabase
  .from('emails')
  .select('*, author:profiles(id, full_name) , status:email_status(*)')
  .eq('id', $route.params.id)
  .single()
  .then(async ({ data, error, status }) => {
    if (error && status !== 406) throw error

    if(data) {
      email.value = data
      loading.value = false
    }
  })
  .catch((error) => {
    toast.error(error.message)
  })
  .finally(() =>{
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

const saveMail = async () => {
  supabase
    .from('emails')
    .upsert([
      {
        id: email.value.id,
        status: email.value.status.id,
        recipients: email.value.recipients,
        subject: email.value.subject,
        body: email.value.body,
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
