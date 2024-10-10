<template>
  <v-col>
    <v-card color="primary" :to="props.to" variant="outlined" class="maincard">
      <v-col align-items="start">
        <v-row justify="center" class="pt-6">
          <v-icon size="48">
            {{ props.icon }}
          </v-icon>
        </v-row>
        <v-row justify="center" class="pb-3">
          <v-card-title>
            {{ props.title }}
          </v-card-title>
        </v-row>
      </v-col>
    </v-card>
  </v-col>
</template>

<script setup>

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  to: {
    type: Object,
    required: true
  }
})

</script>

<style scoped>
.maincard {
  background-color: #ffffff;
  color: #000;
}
</style>
