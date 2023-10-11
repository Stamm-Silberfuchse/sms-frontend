<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
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
            <v-card>
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
              <v-card-item class="pt-4 pb-2 px-6">
                <v-card-title class="text-pre-wrap">
                  {{ item?.title }}
                </v-card-title>
              </v-card-item>
              <v-card-text class="pb-0 px-6 text-pre-wrap">
                {{ item?.description != null && item?.description.length > 0 ? item.description : '-' }}
              </v-card-text>
              <v-card-item>
                <v-card-subtitle class="mt-2 px-6">
                  <v-row class="my-0" justify="space-between">
                    <v-col class="pa-0 me-auto" align-self="center" cols="auto">
                      <v-icon
                        icon="mdi-calendar-outline"
                        size="18"
                        class="me-1 pb-1"
                      ></v-icon>
                      {{ getDateTime(item?.timestamp_create) }}
                    </v-col>
                    <v-col cols="auto" class="pa-0">
                      <Avatar
                        memberID="53fa712f-02ad-4661-b886-208967da085c"
                        tooltip-location="left"
                        :tooltip-append="`erstellt von:\n`"
                        :size="32"
                      />
                    </v-col>
                  </v-row>
                </v-card-subtitle>
              </v-card-item>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <div class="bottom-info mt-6">
        <div class="text-center font-weight-light" style="font-size: 14px;">
          erstellt von <b>Johannes Michaelis</b> am 18.02.2003, 12:00<br>
          zuletzt bearbeitet von <b>Johannes Michaelis</b> am 18.02.2003, 12:00
        </div>
      </div>
    </v-responsive>
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
import Avatar from '@/components/Avatar.vue'

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
