<template>
  <v-card
    variant="flat"
    border
    class="pb-0"
  >
    <v-card-text class="px-3 py-2">
      <v-row class="ma-0 pa-0">
        <v-col cols="auto" align-self="baseline" class="pa-0 pr-1">
          <span class="text-subtitle-1 font-weight-medium">
            {{ props.contact.name }}
          </span>
        </v-col>
        <v-col cols="auto" align-self="baseline" class="pa-0 pr-1">
          <span class="text-subtitle-1 font-weight-regular text-disabled"> ({{ props.contact.relationship }})</span>
        </v-col>
        <v-spacer />
        <v-col v-if="isAdminOrStafue" cols="auto" class="pa-0">
          <!--<DialogContactEdit :memberID="props.member?.id" :contactID="props.contact?.id" />-->
        </v-col>
      </v-row>
      <div class="mt-1"></div>
      <v-row
        v-for="(field, idx) in props.contact.fields"
        :key="`contactfield-${idx}`"
        class="mt-0 mb-1 ml-0"
      >
        <v-col cols="3" align-self="center" class="py-0 px-0">
          <v-card-text class="text-body-1 font-weight-bold py-0 pl-0">
            {{ field.name }}:
          </v-card-text>
        </v-col>
        <v-col class="py-1 pl-0" align-self="center">
          <span class="text-body-1 py-0" v-html="parseField(field?.type, field?.value)">
          </span>
        </v-col>
        <v-col cols="auto" class="py-1" align-self="center">
          <v-icon color="success" size="small" class="pr-4">mdi-email-check-outline</v-icon>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { parseField } from '@/plugins/sms-helper'

import { useAuthStore } from '@/store/auth'

import DialogContactEdit from '@/components/orga/members/DialogContactEdit.vue'

const authStore = useAuthStore()

const props = defineProps({
  member: {
    type: Object,
    required: true
  },
  contact: {
    type: Object,
    required: true
  }
})

const isAdminOrStafue = computed(() => {
  return authStore.isAdmin || authStore.isStafue
})

</script>
