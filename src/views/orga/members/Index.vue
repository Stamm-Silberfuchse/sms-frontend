<template>
  <v-container>
    <PageTitle title="Mitgliederverwaltung" />

    <!-- Buttons -->
    <v-row justify="start" class="mx-0 pt-0 px-3 pb-3">
      <NewMemberDialog />

      <v-btn
        @click="router.push({ name: 'Kategorien bearbeiten'})"
        prependIcon="mdi-cog-outline"
        class="mr-4 mb-4 text-none"
      >
        Kategorien & Felder
      </v-btn>
    </v-row>


    <!-- MembersTable -->
    <v-row class="mx-0 px-3">
      <MembersTable />
    </v-row>
  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router'

import PageTitle from '@/components/PageTitle.vue'
import NewMemberDialog from '@/components/orga/members/NewMemberDialog.vue'
import MembersTable from '@/components/orga/members/MembersTable.vue'

const router = useRouter()
</script>
