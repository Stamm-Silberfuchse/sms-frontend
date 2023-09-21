<template>
  <div class="mt-2 mb-5">
    <v-row class="ma-0">
      <v-btn v-if="back" variant="text" color="primary" icon="mdi-arrow-left" style="margin-left: -16px;" @click="goBack" />
      <h1 class="heading text-primary font-quicksand">
        {{ title }}
      </h1>
    </v-row>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  title: String,
  back: {
    type: Boolean,
    default: false
  }
})

const goBack = () => {
  router.go(-1)
}
</script>
