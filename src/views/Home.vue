<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
        <PageTitle title="Dashboard" />
        <HelloWorld />
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import PageTitle from '@/components/PageTitle.vue'
import HelloWorld from '@/components/HelloWorld.vue'
</script>
