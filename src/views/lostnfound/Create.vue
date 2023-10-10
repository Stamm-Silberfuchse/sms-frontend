<template>
  <v-container>
    <PageTitle
      :back="{ name: 'Fundsachen' }"
      :title="`Fundstück einstellen`"
    ></PageTitle>

    <v-row justify="start" class="mx-0 pt-0 px-3 pb-3">
      <v-btn
        color="primary"
        prepend-icon="mdi-content-save-outline"
        class="mr-4 mb-4 text-none"
        @click="saveFundstueck"
      >
      Speichern
      </v-btn>
    </v-row>

    <v-row
      v-if="!loading"
      justify="center"
      class="mx-0 mt-0 mb-4"
      style="padding-left: -20px;"
    >
      <v-col cols="12" lg="4" md="6" justify="start">
        <VCard class="pb-1">
          <v-carousel
            :continuous="false"
            hide-delimiters
            height="350px"
            style="pointer: cursor;"
          >
            <template v-slot:prev="{ props }">
              <v-btn
                v-if="item?.photoURLs?.length > 1"
                size="small"
                icon
                variant="tonal"
                @click.native.capture.stop="props.onClick"
              >
                <v-icon color="white" size="x-large">
                  mdi-chevron-left
                </v-icon>
              </v-btn>
            </template>
            <template v-slot:next="{ props }">
              <v-btn
                v-if="item?.photoURLs?.length > 1"
                size="small"
                icon
                variant="tonal"
                @click.native.capture.stop="props.onClick"
              >
                <v-icon color="white" size="x-large">
                  mdi-chevron-right
                </v-icon>
              </v-btn>
            </template>
            <v-carousel-item
              v-if="item?.photoURLs?.length > 0"
              v-for="(photoURL,i) in item?.photoURLs"
              :key="i"
              :src="photoURL"
              cover
            ></v-carousel-item>
            <v-row justify="center" v-else class="empty-row">
              <v-col cols="auto" align-self="center">
                <v-icon size="40px" color="grey">
                  mdi-image-off-outline
                </v-icon>
              </v-col>
            </v-row>
          </v-carousel>
          <v-card-item>
            <v-text-field
              v-model="item.title"
              label="Titel"
              outlined
              dense
            ></v-text-field>
            <v-text-field
              v-model="item.description"
              label="Beschreibung"
              outlined
              dense
            ></v-text-field>
          </v-card-item>
        </VCard>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { supabase, getUser } from '@/plugins/supabase'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import PageTitle from '@/components/PageTitle.vue'
import router from '@/router'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const item = ref({
  title: '',
  description: null
})

const saveFundstueck = async () => {
  supabase
    .from('fundstuecke')
    .insert({
      title: item.value.title,
      description: item.value.description,
      usr_id_create: userStore.id,
    })
    .select()
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error

      if(data) {
        toast.success("Fundstück eingestellt.")
        router.push({ name: 'Fundstück ansehen', params: { id: data[0].id } })
      }
    })
    .catch((error) => {
      console.log(error)
      toast.error(error.message)
    })
}
</script>
