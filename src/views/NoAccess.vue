<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
        <PageTitle title="Kein Zutritt" />

        <v-row justify="center" class="mx-0 pt-0 px-3 pb-3">
          <v-img
            src="/wlz_wrong_way.png"
            max-width="200px"
          ></v-img>
        </v-row>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import PageTitle from '@/components/PageTitle.vue'
</script>
