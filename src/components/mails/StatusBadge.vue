<template>
  <v-tooltip :location="tooltipLocation">
    <template v-slot:activator="{ props }">
      <v-chip
        v-bind="props"
        class="ma-2"
        variant="flat"
        :color="colors[email.status]"
        text-color="white"
        :size="size"
      >
        <v-icon>
          {{ icons[email.status] }}
        </v-icon>
      </v-chip>
    </template>
    {{ translations[email.status] }}
  </v-tooltip>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  email: {
    type: Object,
    required: true,
  },
  size: {
    type: [ Number, String ],
    default: 'small'
  },
  tooltipLocation: {
    type: String,
    default: 'start'
  },
})

const colors = {
  'draft': 'grey',
  'pending': 'warning',
  'sent': 'success',
  'archived': 'blue',
  'failed': 'error'
}

const icons = {
  'draft': 'mdi-file-document-edit-outline',
  'pending': 'mdi-clock-outline',
  'sent': 'mdi-check',
  'archived': 'mdi-archive',
  'failed': 'mdi-alert-circle-outline'
}

const translations = {
  'draft': 'Entwurf',
  'pending': 'Überprüfung ausstehend',
  'sent': 'Gesendet',
  'archived': 'Archiviert',
  'failed': 'Fehlgeschlagen'
}
</script>
