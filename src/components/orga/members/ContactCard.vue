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
        <v-col cols="auto" class="pa-0">
          <v-btn
            icon
            size="x-small"
            variant="flat"
            @click="onEditContact"
          >
            <v-icon size="x-large">
              mdi-pencil
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <div class="mt-3"></div>
      <v-row
        v-for="(field, idx) in props.contact.fields"
        :key="`contact-field-${idx}`"
        class="mt-0 mb-1 ml-0"
      >
        <v-col cols="3" class="py-0 pr-0">
          <v-card-text class="text-body-1 font-weight-bold py-0 pl-0">
            {{ field.name }}:
          </v-card-text>
        </v-col>
        <v-col cols="9" class="py-1 pl-0">
          <v-card-text class="text-body-1 py-0" v-html="parseField(field.type, field.value)">
          </v-card-text>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

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

</script>
