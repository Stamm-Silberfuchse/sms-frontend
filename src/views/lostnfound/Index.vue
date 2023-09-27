<template>
  <v-container>
    <PageTitle title="Fundsachen" />

    <v-row justify="start" class="mx-0 pt-0 px-3 pb-4">
      <v-btn
        color="primary"
        @click="createLFItem"
        prependIcon="mdi-tag-plus-outline"
        class="mr-4 mb-4 text-none"
      >
        Einstellen
      </v-btn>
    </v-row>

    <v-row
      justify="start"
      class="mx-0 mt-0 mb-4"
      style="padding-left: -20px;"
    >
      <v-col
        cols="12"
        xl="3"
        lg="4"
        sm="6"
        justify="start"
        v-for="(item, i) in items"
        :key="`${item.id}`"
      >
        <LostNFoundCard
          :title="item.title"
          :description="item.description"
          :id="item.id"
          :photoURLs="item.photoURLs"
          :timestamp_create="item.timestamp_create"
        ></LostNFoundCard>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router';
import { supabase } from '@/plugins/supabase'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import PageTitle from '@/components/PageTitle.vue'
import LostNFoundCard from '@/components/LostNFoundCard.vue'

const router = useRouter()

const loading = ref(true)
const items = ref([])

const fetchData = () => {
  supabase
    .from('lost_found')
    .select('*, created:profiles!lost_found_usr_id_create_fkey(id, full_name, display_name, avatar_url),\
                changed:profiles!lost_found_usr_id_change_fkey(id, full_name, display_name, avatar_url)')
    .order('timestamp_create', { ascending: false })
    .then(async ({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        console.log(data)
        items.value = data
      }
    })
    .catch((error) => {
      console.error(error)
      toast.error(error.message)
    })
    .finally(() =>{
      loading.value = false
    })
}

fetchData()

const createLFItem = () => {
  router.push({ name: 'Fundstück erstellen' })
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
        tonUpdated, oast.error(error.message)
      } else {
        emails.value = emails.value.filter(el => el.id !== id)
        toast.success('Mail gelöscht.')
      }
    })
}
</script>

<style>
.mail-title {
  margin-top: -6px;
}
</style>
