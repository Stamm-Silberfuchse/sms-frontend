<template>
  <v-dialog width="340">
    <template v-slot:activator="{ props }">
      <v-btn
        color="primary"
        v-bind="props"
        prependIcon="mdi-account-plus-outline"
        class="mr-4 mb-4 text-none"
      >
        Anlegen
      </v-btn>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-form
          ref="form"
          v-model="valid"
          :loading="loading"
          lazy-validation
          @submit.prevent
        >
          <v-card-title>
            Neuer User
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="firstName"
              label="Vorname"
              required
              type="text"
              :rules="firstNameRules"
              class="py-2"
            ></v-text-field>
            <v-text-field
              v-model="lastName"
              label="Nachname"
              required
              type="text"
              :rules="lastNameRules"
              class="pb-2"
            ></v-text-field>
            <v-text-field
              v-model="email"
              label="E-Mail"
              required
              type="email"
              :rules="emailRules"
              class="pb-2"
            ></v-text-field>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn
              variant="text"
              class="text-none"
              @click="onAbort(isActive)"
            >
              Abbrechen
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              :disabled="loading || !valid"
              :loading="loading"
              color="primary"
              variant="elevated"
              class="text-none"
              type="submit"
              @click.prevent="onAddUser(isActive)"
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
import { ref, computed} from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import axios from 'axios'

import { useUsersStore } from '@/store/users'

const usersStore = useUsersStore()

const loading = ref(false)

const firstName = ref('')
const lastName = ref('')
const email = ref('')

const form = ref(null)
const valid = ref(false)

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
const emailRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte gib eine E-Mail an.'
  },
  value => {
    const regex = /\S+@\S+\.\S+/
    if (regex.test(value)) return true
    return 'Bitte gib eine gültige E-Mail an.'
  },
])

const onAddUser = async (isActive) => {
  loading.value = true
  const { valid } = await form.value?.validate()
  if (!valid) {
    toast.info('Bitte überprüfe deine Angaben.')
    loading.value = false
    return
  }
  await axios.get(import.meta.env.VITE_CF_CREATE_USER, {
    params: {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value
    }
  })
  .then((response) => {
    console.log(response)
    isActive.value = false
    loading.value = false
    form.value?.reset()
    toast.success('User erfolgreich angelegt.')
  })
  .catch((error) => {
    console.error(error)
    loading.value = false
    toast.error('User konnte nicht angelegt werden.')
  })
  // await usersStore.addUser(payload)

}

const onAbort = (isActive) => {
  isActive.value = false
  form.value?.reset()
}

</script>
