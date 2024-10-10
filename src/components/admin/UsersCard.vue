<template>
  <v-card
    :loading="loading"
    variant="tonal"
    class="w-100"
    :to="{ name: 'Nutzer' }"
  >
    <v-card-item title="User">
      <template v-slot:subtitle>
        Gesamtanzahl
      </template>
    </v-card-item>

    <v-card-text class="py-0">
      <v-row align="center" no-gutters>
        <v-col
          cols="6"
          class="text-h2 font-Quicksand font-weight-bold"
        >
          {{ numberOfUsers > 0 ? numberOfUsers : '' }}
        </v-col>

        <v-col cols="6" class="text-right">
          <v-icon
            color="primary"
            icon="mdi-account"
            size="90"
          ></v-icon>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { db } from '@/plugins/firebase'
import { getFirestore, collection, query, where, getCountFromServer } from 'firebase/firestore'

const loading = ref(true)
const numberOfUsers = ref(0)

const fetchData = async () => {
  loading.value = true
  const q = query(collection(db, 'users'), where('disabled', '==', false), where('emailVerified', '==', true))
  const snapshot = await getCountFromServer(q)
  numberOfUsers.value = snapshot.data().count
  loading.value = false
}

onBeforeMount(async () => {
  await fetchData()
})

</script>
