<template>
  <v-container>
    <PageTitle
      :back="{ name: 'Fundsachen' }"
      :title="`Fundstück: ${item?.title}`"
      :loading="loading"
    ></PageTitle>

    <v-row justify="start" class="mx-0 pt-0 px-3 pb-3">
      <v-btn
        color="primary"
        :to="{ name: 'Fundstück bearbeiten', params: { id: $route.params.id } }"
        prependIcon="mdi-pencil"
        class="mr-4 mb-4 text-none"
      >
        Bearbeiten
      </v-btn>
      <v-btn
        prependIcon="mdi-delete"
        class="mr-4 mb-4 text-none"
        @click="deleteFundstueck"
      >
        Löschen
      </v-btn>
    </v-row>

    <v-row
      v-if="!loading"
      justify="center"
      class="mx-0 mt-0 mb-4"
      style="padding-left: -20px;"
    >
      <v-col cols="12" lg="4" md="6" justify="start">
        <v-card class="pb-1">
          <v-carousel
            :continuous="false"
            hide-delimiters
            height="350px"
          >
            <template v-slot:prev="{ props }">
              <v-btn
                v-if="photos.length > 1"
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
                v-if="photos.length > 1"
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
              v-if="hasPhotos > 0"
              v-for="(photoURL,i) in photos"
              :key="i"
            >
              <v-img
                :src="photoURL"
                :aspect-ratio="1"
                cover
              >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular
                    color="grey-lighten-4"
                    indeterminate
                  ></v-progress-circular>
                </div>
              </template>
              </v-img>
            </v-carousel-item>
            <v-row justify="center" v-else class="empty-row">
              <v-col cols="auto" align-self="center">
                <v-icon size="40px" color="grey">
                  mdi-image-off-outline
                </v-icon>
              </v-col>
            </v-row>
          </v-carousel>
          <v-card-title class="pt-4">
            {{ item?.title }}
          </v-card-title>
          <v-card-subtitle>
            {{ item?.description != null && item?.description.length > 0 ? item.description : '-' }}
          </v-card-subtitle>
          <v-card-item>
            <template v-slot:subtitle v-if="item?.timestamp_create.length > 0">
              <v-icon
                icon="mdi-calendar-outline"
                size="18"
                class="me-1 pb-1"
              ></v-icon>
              {{ getDateTime(item?.timestamp_create) }}
            </template>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { supabase } from '@/plugins/supabase'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

import PageTitle from '@/components/PageTitle.vue'

const $route = useRoute()
const $router = useRouter()

const loading = ref(true)

const item = ref(null)

const fetchData = () => {
  loading.value = true

  supabase.rpc('get_fundstuecke_with_images_by_id', { fund_id: $route.params.id })
    .then(async ({ data, error }) => {
      if (error) throw error
      if(data) {
        item.value = data[0]
        loading.value = false
      }
    })
}

fetchData()

const getDateTime = (timestamp) => {
  return format(new Date(timestamp), 'EEEEEE, dd.MM.yyyy HH:mm', {locale: de})
}

const deleteFundstueck = async () => {
  supabase
    .from('fundstuecke')
    .delete()
    .eq('id', $route.params.id)
    .then(async ({ error }) => {
      if(error) {
        console.error(error)
        toast.error(error.message)
      } else {
        toast.success('Fundstück gelöscht.')
        $router.push({ name: 'Fundsachen' })
      }
    })
}

const photos = computed(() => {
  if(item.value.images[0].id === null) return []
  return item.value.images.map((image) => {
    return image.downloadURL
  })
})

const hasPhotos = computed(() => {
  if(item.value === null) return false
  return item.value.images[0]?.id !== null
})
</script>

<style>
.v-carousel {
  background-color: #EEEEEE;
}
</style>
