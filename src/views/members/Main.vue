<template>
  <v-container>
    <PageTitle title="Mitgliederverwaltung" />

    <v-col>
      <v-row justify="start">
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

      <NewMemberDialog v-model="dialog" />

      <v-row class="mt-4">
        <MembersTable />
      </v-row>
    </v-col>
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
