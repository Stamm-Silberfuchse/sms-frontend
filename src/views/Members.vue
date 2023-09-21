<template>
  <v-container>
    <PageTitle title="Mitgliederverwaltung" />
    <MembersTable />
  </v-container>
</template>

<script setup>
import MembersTable from '@/components/MembersTable.vue';
import PageTitle from '@/components/PageTitle.vue';
</script>
