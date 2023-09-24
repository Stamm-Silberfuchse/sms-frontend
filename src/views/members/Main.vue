<template>
  <v-container>
    <PageTitle title="Mitgliederverwaltung" />

    <!-- Buttons -->
    <v-row justify="start" class="mx-0 pt-0 px-3 pb-3">
      <v-btn
        color="primary"
        @click="createUser"
        prependIcon="mdi-account-plus"
        class="mr-4 mb-4 text-none"
      >
        Anlegen
      </v-btn>
      <v-btn
        @click="goToSettings"
        prependIcon="mdi-cog-outline"
        class="mr-4 mb-4 text-none"
      >
        Einstellungen
      </v-btn>
    </v-row>

    <!-- NewMemberDialog -->
    <NewMemberDialog v-model="dialog" />

    <!-- MembersTable -->
    <v-row class="mx-0 px-3">
      <MembersTable />
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import PageTitle from '@/components/PageTitle.vue'
import NewMemberDialog from '@/components/NewMemberDialog.vue'
import MembersTable from '@/components/MembersTable.vue'

const dialog = ref(false)

const createUser = () => {
  dialog.value = true
}

const goToSettings = () => {
  toast.info('Not implemented yet')
}
</script>
