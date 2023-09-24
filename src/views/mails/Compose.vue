<template>
  <v-container>
    <PageTitle title="Mail verfassen" :back="true" />

    <v-row justify="start" class="mx-0 pt-0 px-3">
      <v-btn
        color="primary"
        prepend-icon="mdi-send-clock-outline"
        :disabled="isDisabled"
        class="mr-4 mb-4 text-none"
        @click="sendMail"
      >
        Senden
      </v-btn>
      <v-btn
        prepend-icon="mdi-content-save-outline"
        :disabled="isDisabled"
        class="mr-4 mb-4 text-none"
        @click="saveMail"
      >
        Speichern
      </v-btn>
    </v-row>

    <v-row
      v-if="!loading"
      justify="start"
      class="mx-0 mt-0 mb-4"
      style="padding-left: -20px;"
    >
      <v-col cols="12">
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
import { computed, ref, toRaw } from 'vue'
import { useRouter } from 'vue-router'
import { supabase, getUser } from '@/plugins/supabase'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import PageTitle from '@/components/PageTitle.vue'

const router = useRouter()

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
  const user = await getUser()
  supabase
    .from('emails')
    .insert([
      {
        status: 1,
        recipients: recipients.value,
        subject: subject.value,
        body: body.value,
        author: user.id
      },
    ])
    .select()
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error

      if(data) {
        toast.success("Entwurf gespeichert.")
        router.push('/mails/edit/' + data[0].id)
      }
    })
    .catch((error) => {
      console.log(error)
      toast.error(error.message)
    })
}
</script>
