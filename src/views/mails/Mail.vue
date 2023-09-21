<template>
  <v-container>
    <PageTitle title="Mails" />

    <v-btn
      color="primary"
      @click="sendMail"
      prependIcon="mdi-email-edit-outline"
    >
      Verfassen
    </v-btn>

    <v-list class="mt-10">
      <v-list-item
        v-for="(email, i) in emails"
        :key="i"
      >
        <v-list-item-title>
          {{ email.subject }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ email.body }}
        </v-list-item-subtitle>
        <template v-slot:append>
          <v-btn
            color="primary"
            icon="mdi-eye"
            variant="plain"
          ></v-btn>
          <v-btn
            color="primary"
            icon="mdi-pencil"
            variant="plain"
          ></v-btn>
          <v-btn
            color="primary"
            icon="mdi-delete"
            variant="text"
          ></v-btn>
          <v-btn
            color="primary"
            icon="mdi-send-check-outline"
            variant="text"
          ></v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router';
import { supabase } from '@/plugins/supabase'

import PageTitle from '@/components/PageTitle.vue'

const router = useRouter()

const emails = ref([])

supabase
  .from('emails')
  .select('*')
  .then(({ data, error, status }) => {
    if (error && status !== 406) throw error

    if(data) {
      emails.value = data
    }
  })
  .catch((error) => {
    toast.error(error.message)
  })

const sendMail = () => {
  router.push('/mails/compose')
}
</script>
