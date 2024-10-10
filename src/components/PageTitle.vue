<template>
  <v-row class="mx-0 mt-2 mb-6 px-0">
    <v-btn
      v-if="back"
      variant="text"
      color="primary"
      icon="mdi-arrow-left"
      @click="goBack"
    />
    <h1
      v-if="!loading"
      :class="`heading text-primary font-Quicksand ${back ? '' : 'ml-3'}`"
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
    type: [ Boolean, Object ],
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const goBack = () => {
  if(typeof(props.back) === 'object') {
    router.push(props.back)
  } else {
    router.go(-1)
  }
}
</script>

<style>
.v-skeleton-loader > div > div {
  margin-left: 0 !important;
  margin-right: 0 !important;
}
</style>
