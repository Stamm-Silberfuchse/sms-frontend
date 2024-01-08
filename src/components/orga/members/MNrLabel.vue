<template>
  <v-chip
    class="my-2"
    variant="outlined"
    color="primary"
    label
    size="small"
  >
  M{{ props.mNr }}
  </v-chip>
</template>

<script setup>
const props = defineProps({
  mNr: {
    type: Number,
    required: true,
  },
})
</script>
