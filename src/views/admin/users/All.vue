<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
        <PageTitle title="Alle User" />

        <v-row justify="start" class="mx-0 pt-0 px-3 pb-3">
          <AllUsersTable />
        </v-row>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import PageTitle from '@/components/PageTitle.vue'
import AllUsersTable from '@/components/admin/users/AllUsersTable.vue'

</script>
