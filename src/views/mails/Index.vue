<template>
  <v-container>
    <PageTitle title="Mails" />

    <v-row justify="start" class="mx-0 pt-0 px-3 pb-4">
      <v-btn
        color="primary"
        @click="composeMail"
        prependIcon="mdi-email-edit-outline"
        class="mr-4 mb-4 text-none"
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

    <v-row class="mx-0 px-3">
      <v-slide-y-transition
        class="py-0"
        group
      >
        <template v-for="(email, i) in emails" :key="`${i}-${email.id}`">
          <v-card
            width="100%" class="mb-1 pa-4"
          >
            <v-row justify="start">
              <v-col cols="auto">
                <Avatar :memberID="email.author.id" />
              </v-col>
              <v-col>
                <v-card-item
                  :title="email.subject"
                  class="pa-0 mail-title"
                >
                  <template v-slot:subtitle>
                    <v-icon
                      icon="mdi-calendar-outline"
                      size="18"
                      class="me-1 pb-1"
                    ></v-icon>
                    {{ getDateTime(email.created_at) }}
                  </template>
                </v-card-item>
              </v-col>
              <v-col cols="auto" class="pr-0" align-self="center">
                <v-chip
                  class="ma-2"
                  variant="flat"
                  :color="email.status.color"
                  text-color="white"
                  :prepend-icon="email.status.mdi_icon"
                  size="small"
                >
                  {{ email.status.display_name }}
                </v-chip>
              </v-col>
              <v-col cols="auto" class="pl-0">
                <v-btn
                  color="primary"
                  icon="mdi-delete"
                  variant="text"
                  @click="deleteMail(email.id)"
                ></v-btn>
                <v-btn
                  color="primary"
                  icon="mdi-pencil"
                  variant="text"
                  :to="`/mails/edit/${email.id}`"
                ></v-btn>
              </v-col>
            </v-row>
          </v-card>
        </template>
      </v-slide-y-transition>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router';
import { supabase } from '@/plugins/supabase'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

import PageTitle from '@/components/PageTitle.vue'
import Avatar from '@/components/Avatar.vue'

const router = useRouter()

const loading = ref(true)
const emails = ref([])
const emailStatus = ref([])

function Sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

supabase
  .from('emails')
  .select('*, author:profiles(id, full_name) , status:email_status(*)')
  .order('created_at', { ascending: true })
  .then(async ({ data, error, status }) => {
    if (error && status !== 406) throw error

    if(data) {
      for(let i = data.length-1; i >= 0; i--) {
        emails.value.push(data[i])
        await Sleep(40)
      }
      // emails.value = data
    }
  })
  .catch((error) => {
    toast.error(error.message)
  })
  .finally(() =>{
    loading.value = false
  })

const composeMail = () => {
  router.push('/mails/compose')
}

const editLists = () => {
  toast.info('Not implemented yet')
}

const goToSettings = () => {
  toast.info('Not implemented yet')
}

const deleteMail = async (id) => {
  supabase
    .from('emails')
    .delete()
    .eq('id', id)
    .then(async ({ error }) => {
      if(error) {
        throw error
        toast.error(error.message)
      } else {
        emails.value = emails.value.filter(el => el.id !== id)
        toast.success('Mail gelöscht.')
      }
    })
}

const getDateTime = (date) => {
  return format(new Date(date), 'dd.MM.yyyy HH:mm', {locale: de})
}

const getInitials = (full_name) => {
  return full_name.split(' ').map(n => n[0]).join('')
}
</script>

<style>
.mail-title {
  margin-top: -6px;
}
</style>
