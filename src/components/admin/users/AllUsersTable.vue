<template>
  <v-data-table
    :headers="headers"
    :items="users"
    :sort-by="[{ key: 'calories', order: 'asc' }]"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar flat class="px-2">
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          density="compact"
          label="Suche"
          single-line
          hide-details
        ></v-text-field>
      </v-toolbar>
    </template>

    <template v-slot:item.actions="{ item }">
      <v-icon
        size="small"
        class="me-2"
        @click="editItem(item)"
      >
        mdi-pencil
      </v-icon>
    </template>
  </v-data-table>
</template>

<script setup>
import { ref, computed } from 'vue'

import { useUsersStore } from '@/store/users'

const usersStore = useUsersStore()

const headers = ref([
  {
    title: "Name",
    key: "full_name",
  },
  {
    title: "Anzeigename",
    key: "display_name",
  },
  {
    title: "E-Mail",
    key: "email",
  },
  {
    title: "Status",
    key: "status",
  }
])

const users = computed(() => usersStore.users)

</script>
