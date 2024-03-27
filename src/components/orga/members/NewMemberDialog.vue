<template>
  <v-dialog width="340">
    <template v-slot:activator="{ props }">
      <v-btn
        color="primary"
        v-bind="props"
        prependIcon="mdi-account-plus"
        class="mr-4 mb-4 text-none"
      >
        Anlegen
      </v-btn>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-form fast-fail ref="form">
          <v-card-title>
            Neues Mitglied
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="firstName"
              label="Vorname"
              required
              :rules="firstNameRules"
            ></v-text-field>
            <v-text-field
              v-model="lastName"
              label="Nachname"
              required
              :rules="lastNameRules"
            ></v-text-field>
            <v-text-field
              v-model="begin"
              label="Beitrittsdatum"
              required
              type="date"
              :rules="beginRules"
            ></v-text-field>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn
              variant="text"
              class="text-none"
              @click="isActive.value = false"
            >
              Abbrechen
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              :disabled="loading || !(firstName.length>0) || !(lastName.length>0) || !(begin.length>0)"
              :loading="loading"
              color="primary"
              variant="elevated"
              class="text-none"
              type="submit"
              @click.prevent="createMember(isActive)"
            >
              Anlegen
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useMembersStore } from '@/store/members'

const router = useRouter()

const membersStore = useMembersStore()

const loading = ref(false)

const firstName = ref('')
const lastName = ref('')
const begin = ref('')

const form = ref(null)

const firstNameRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte gib einen Vornamen an.'
  },
])

const lastNameRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte gib einen Nachnamen an.'
  },
])

const beginRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte gib ein Beitrittsdatum an.'
  },
])

const createMember = async () => {
  loading.value = true
  const { valid } = await form.value?.validate()
  if (!valid) {
    toast.info('Bitte überprüfe deine Angaben.')
    loading.value = false
    return
  }

  const uid = await membersStore.addMember({
    FIRST_NAME: firstName.value,
    LAST_NAME: lastName.value,
    NAME: `${firstName.value} ${lastName.value}`,
    begin: begin.value,
  })
  toast.success("Mitglied angelegt.")
  loading.value = false
  router.push({ name: 'Mitglied ansehen', params: { id: uid } })
}

</script>
