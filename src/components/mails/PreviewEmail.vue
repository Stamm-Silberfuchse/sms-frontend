<template>
  <v-overlay
      :model-value="props.show"
      class="align-center justify-center myPreview"
      opacity="70%"
      @click:outside="onClickOutside"
    >
      <v-container class="myPreviewContainer pa-0">
        <v-card class="pa-4 w-100" :rounded="0">
          <div v-html="mjmlBody"></div>
        </v-card>
      </v-container>
    </v-overlay>
</template>

<script setup>
import { computed } from 'vue'
import { emailTemplate } from '@/plugins/sms-helper'
import mjml2html from 'mjml-browser'

const emits = defineEmits(['close'])

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  mail: {
    type: Object,
    required: true
  }
})

const onClickOutside = () => {
  emits('close')
}

const mjmlBody = computed(() => {
  let a = mjml2html(emailTemplate(props.mail?.body))
  return a.html
})
</script>


<style>
.myPreview > .v-overlay__content {
  width: 86% !important;
}
.myPreviewContainer {
  max-width: 1000px !important;
}
</style>
