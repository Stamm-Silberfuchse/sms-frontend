<template>
  <v-card
    :loading="loading"
    variant="flat"
    class="w-100"
    :to="{ name: 'Mitglieder' }"
  >
    <v-card-item title="Mitglieder*innen">
      <template v-slot:subtitle>
        insgesamt
      </template>
    </v-card-item>

    <v-card-text class="py-0">
      <v-row align="center" no-gutters>
        <v-col
          cols="6"
          class="text-h2 font-Quicksand font-weight-bold"
        >
          {{ numberOfMembers > 0 ? numberOfMembers : '' }}
        </v-col>

        <v-col cols="6" class="text-right">
          <v-icon
            color="primary"
            icon="mdi-account-group"
            size="90"
          ></v-icon>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { getFirestore, collection, query, where, getCountFromServer } from 'firebase/firestore'

const loading = ref(false)
const numberOfMembers = ref(0)

const fetchData = async () => {
  loading.value = true
  const db = getFirestore()
  const q = query(collection(db, 'members'), where('status', '==', 'active'))
  const snapshot = await getCountFromServer(q)
  numberOfMembers.value = snapshot.data().count
  loading.value = false
}

onBeforeMount(async () => {
  await fetchData()
})

</script>
