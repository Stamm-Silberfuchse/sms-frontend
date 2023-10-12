<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
        <PageTitle
          :back="{ name: 'Fundstück ansehen', params: { id: $route.params.id } }"
          :title="`Fundstück: ${title}`"
          :loading="loading"
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
            <v-card>
              <v-carousel
                :continuous="false"
                hide-delimiters
                height="350px"
                v-model="carouselIndex"
              >
                <template v-slot:prev="{ props }">
                  <v-btn
                    v-if="photos.length > 1"
                    size="small"
                    icon
                    color="primary"
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
                    color="primary"
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
                  :value="i"
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
                <div class="deleteOverlay">
                  <div class="uploadButton">
                    <v-btn
                      size="small"
                      icon
                      color="primary"
                      @click="uploader.click()"
                    >
                      <v-icon size="large">
                        mdi-camera-plus
                      </v-icon>
                    </v-btn>
                  </div>
                  <div class="deleteButton">
                    <v-btn
                      size="small"
                      icon
                      color="primary"
                      @click="deleteImage"
                    >
                      <v-icon size="large">
                        mdi-delete
                      </v-icon>
                    </v-btn>
                  </div>
                </div>
              </v-carousel>
              <v-card-item>
                <v-text-field
                  v-model="item.title"
                  label="Titel"
                  outlined
                  dense
                ></v-text-field>
                <v-textarea
                  v-model="item.description"
                  label="Beschreibung"
                  outlined
                  rows="3"
                ></v-textarea>
                <v-card-subtitle>
                  <v-row class="px-4 my-0" justify="space-between">
                    <v-col class="pa-0 me-auto" align-self="center" cols="auto">
                      <v-icon
                        icon="mdi-calendar-outline"
                        size="18"
                        class="me-1 pb-1"
                      ></v-icon>
                      {{ getDateTime(item?.timestamp_create) }}
                    </v-col>
                    <v-col cols="auto" class="pa-0">
                      <Avatar memberID="53fa712f-02ad-4661-b886-208967da085c" tooltip-location="left" :size="32" />
                    </v-col>
                  </v-row>
                </v-card-subtitle>

                <v-file-input
                  ref="uploader"
                  v-model="imageFile"
                  accept="image/png, image/jpeg, image/bmp"
                  class="d-none"
                  type="file"
                  @update:modelValue="onFileChanged"
                />
              </v-card-item>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <div v-if="!loading" class="bottom-info mt-6">
        <div class="text-center font-weight-light" style="font-size: 14px;">
          <p>erstellt von <b>{{ item?.user_create[0].display_name }}</b> am {{ fdate(item?.timestamp_create) }}</p>
          <p v-if="item?.timestamp_change != null">
            zuletzt bearbeitet von <b>{{ item?.user_change[0].display_name }}</b> am {{ fdate(item?.timestamp_change) }}
          </p>
        </div>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { supabase } from '@/plugins/supabase'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { useRoute } from 'vue-router'
import format from 'date-fns/format'
import de from 'date-fns/locale/de'

import PageTitle from '@/components/PageTitle.vue'
import Avatar from '@/components/Avatar.vue'
import router from '@/router'

import { useAuthStore } from '@/store/auth'

const $route = useRoute()

const loading = ref(true)
const item = ref(null)

const uploader = ref()

const title = ref('')
const imageFile = ref(null)

const carouselIndex = ref(0)

const authStore = useAuthStore()

const fetchData = () => {
  loading.value = true

  // fetch member
  // , created:profiles!fundstuecke_usr_id_create_fkey(id, full_name, display_name, avatar_url),\
  // changed:profiles!fundstuecke_usr_id_change_fkey(id, full_name, display_name, avatar_url)
  supabase.rpc('get_fundstuecke_with_images_by_id2', { fund_id: $route.params.id })
    .then(async ({ data, error }) => {
      if (error) throw error
      if(data) {
        console.log(data[0])
        item.value = data[0]
        title.value = data[0].title
        loading.value = false
      }
    })
}

fetchData()

const getDateTime = (timestamp) => {
  return format(new Date(timestamp), 'EEEEEE, dd.MM.yyyy HH:mm', {locale: de})
}

const saveFundstueck = async () => {
  console.log(item)
  supabase
    .from('fundstuecke')
    .upsert([
      {
        id: item.value.id,
        title: item.value.title,
        description: item.value.description,
        usr_id_change: authStore.id,
        timestamp_change: new Date()
      },
    ])
    .select()
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        toast.success("Änderungen gespeichert.")
        router.push({ name: 'Fundstück ansehen', params: { id: item.value.id } })
      }
    })
    .catch((error) => {
      console.error(error)
      toast.error(error.message)
    })
}

const onFileChanged = async () => {
  loading.value = true
  let filename = imageFile.value[0].name
  const date = format(new Date(), 'yyyy-MM-dd-HH-mm-ss')
  filename = `${date}_${item.value.id}_${filename}`
  // upload image
  var { data, error } = await supabase.storage
    .from('fundstuecke')
    .upload(filename, imageFile.value[0], {
      cacheControl: '3600',
      upsert: true
    })
  if(error) {
    console.error(error)
    toast.error(error.message)
    throw error
  }
  // retrieve public URL
  const url = supabase.storage
    .from('fundstuecke')
    .getPublicUrl(data.path)
  // add image to database
  var { data, error } = await supabase
    .from('images')
    .insert({
      path: data.path,
      downloadURL: url.data.publicUrl
    })
    .select()
  if(error) {
    console.error(error)
    toast.error(error.message)
    throw error
  }
  // add relationship between image and fundstueck
  var { data, error } = await supabase
    .from('fundstuecke_images')
    .insert({
      fundstueck_id: item.value.id,
      image_id: data[0].id
    })
    .select()
  if(error) {
    console.error(error)
    toast.error(error.message)
    throw error
  }
  toast.success('Bild hochgeladen.')
  fetchData()
}

const deleteImage = async () => {
  const { data, error } = await supabase
    .storage
    .from('fundstuecke')
    .remove([])


  supabase.from('fundstuecke').upsert({
    id: uuid.id,
    avatar_url: null
  })
  .select()
  .then(({ data, error }) => {
    console.log(error, data)
    authStore.setAvatarURL(null)
    toast.success('Bild wurde entfernt.')
    loading.value = false
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

const date_created = computed(() => {
  if(item.value === null) return ''
  return format(new Date(item.value?.timestamp_create), 'dd.MM.yyyy, HH:mm', {locale: de})
})

const fdate = (date) => {
  if(date === null || date === undefined) return ''
  return format(new Date(date), 'dd.MM.yyyy, HH:mm', {locale: de})
}

</script>

<style>
.uploadOverlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: baseline;
}

.uploadButton {
  margin-top: 10px;
  margin-right: 10px;
}

.deleteOverlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: transparent;
  display: flex;
  justify-content: right;
  align-items: start;
}

.deleteButton {
  margin-top: auto;
  margin-top: 10px;
  margin-right: 10px;
}

.v-carousel {
  background-color: #EEEEEE;
}
</style>
