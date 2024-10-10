<template>
  <v-dialog v-model="props.active" max-width="320" persistent>
    <v-list
      class="py-2"
      color="primary"
      elevation="12"
      rounded="lg"
    >
      <v-list-item
        prepend-icon="mdi-calendar"
        title="Lädt hoch..."
      >
        <template v-slot:prepend>
          <div class="pe-4">
            <v-icon color="primary" size="large"></v-icon>
          </div>
        </template>

        <template v-slot:append>
          <v-progress-circular
            color="primary"
            indeterminate="disable-shrink"
            size="16"
            width="2"
            class="mr-2"
          ></v-progress-circular>
        </template>
      </v-list-item>
    </v-list>
  </v-dialog>
</template>

<script setup>
const props = defineProps({
  active: {
    type: Boolean,
    default: false
  }
})
</script>
