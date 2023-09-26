<template>
  <v-row class="mx-0 pt-4 pb-6 px-3" align="end">
    <v-btn
      v-if="back"
      variant="text"
      color="primary"
      icon="mdi-arrow-left"
      style="margin-left: -16px;"
      @click="goBack"
    />
    <h1
      v-if="!loading"
      class="heading text-primary font-quicksand"
    >
      {{ title }}
    </h1>
    <v-skeleton-loader
      v-else
      type="subtitle"
      boilerplate
      :width="300"
      color="primary"
      background-color="transparent"
      loading-text="Lade..."
      style="background-color: #FFFFFF00 !important;"
    />
    <div v-if="!loading" class="ml-2">
      <slot></slot>
    </div>
  </v-row>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  title: String,
  back: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const goBack = () => {
  router.go(-1)
}
</script>

<style>
.v-skeleton-loader > div > div {
  margin-left: 0 !important;
  margin-right: 0 !important;
}
</style>
