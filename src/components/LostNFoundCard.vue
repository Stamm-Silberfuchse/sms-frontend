<template>
  <v-card class="pb-1" @click.prevent="gotoLFItem" :ripple="false">
    <v-carousel
      :continuous="false"
      hide-delimiters
      height="250px"
      style="pointer: cursor;"
    >
      <template v-slot:prev="{ props }">
        <v-btn
          v-if="photoURLs.length > 1"
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
          v-if="photoURLs.length > 1"
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
        v-if="photoURLs.length > 0"
        v-for="(photoURL,i) in photoURLs"
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
    <v-card-title>
      {{ title }}
    </v-card-title>
    <v-card-subtitle>
      {{ description != null && description.length > 0 ? description : '-' }}
    </v-card-subtitle>
    <v-card-item>
      <template v-slot:subtitle v-if="timestamp_create.length > 0">
        <v-icon
          icon="mdi-calendar-outline"
          size="18"
          class="me-1 pb-1"
        ></v-icon>
        {{ getDateTime(timestamp_create) }}
      </template>
    </v-card-item>
  </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const router = useRouter()

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: [ String, null ],
    default: null
  },
  id: {
    type: Number,
    required: true
  },
  photoURLs: {
    type: Array,
    default: () => []
  },
  timestamp_create: {
    type: String,
    default: ''
  }
})

const gotoLFItem = () => {
  router.push({ name: 'Fundstück ansehen', params: { id: props.id } })
}

const getDateTime = (date) => {
  return format(new Date(date), 'EEEEEE, dd.MM.yyyy HH:mm', {locale: de})
}
</script>

<style>
.empty-row {
  background-color: rgba(127, 127, 127, 0.2);
}

.v-window-item {
  cursor: pointer;
}
</style>
