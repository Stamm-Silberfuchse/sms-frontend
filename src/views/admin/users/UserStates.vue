<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
        <PageTitle title="Administration" />

        <v-row
          justify="start"
          class="mx-0 mt-0 mb-4"
          style="padding-left: -20px;"
        >

        </v-row>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'
import { useUsersStore } from '@/store/users'
import PageTitle from '@/components/PageTitle.vue'

const userStore = useUsersStore()

</script>
