<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
        <PageTitle title="Mitgliederverwaltung" :back="{ name: 'Verwaltung' }">
          <v-col>
            <v-icon
            class="pb-1"
            icon="mdi-account-group"
            size="large"
            color="primary"
          />
          </v-col>
        </PageTitle>

        <!-- Buttons -->
        <v-row justify="start" class="mx-0 pt-0 px-3 pb-3">
          <DialogMemberNew />

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
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router'

import PageTitle from '@/components/PageTitle.vue'
import DialogMemberNew from '@/components/orga/members/DialogMemberNew.vue'
import MembersTable from '@/components/orga/members/MembersTable.vue'

const router = useRouter()
</script>
