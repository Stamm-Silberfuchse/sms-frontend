<template>
  <v-dialog width="400">
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
            User anlegen
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="name"
              label="Name"
              required
              type="text"
              :rules="nameRules"
              class="py-2"
            ></v-text-field>
            <v-text-field
              v-model="email"
              label="E-Mail"
              required
              type="email"
              :rules="emailRules"
              class="pb-2"
            ></v-text-field>
            <v-select
              v-model="role"
              label="Rolle"
              required
              :items="roles"
              item-title="text"
              item-value="value"
              class="pb-2"
            ></v-select>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn
              variant="text"
              class="text-none"
              :disabled="loading"
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
import { ref} from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { getAuth } from 'firebase/auth'
import { functions } from '@/plugins/firebase'
import { httpsCallable } from 'firebase/functions'
import { useConfirm } from 'vuetify-use-dialog'

const createConfirm = useConfirm()

const loading = ref(false)

const name = ref('')
const email = ref('')
const role = ref('')

const form = ref(null)
const valid = ref(false)

const roles = ref([
  {
    text: 'Admin',
    value: 'admin',
  },
  {
    text: 'StaFü',
    value: 'stafue',
  },
  {
    text: 'Führung',
    value: 'fuehrung',
  },
  {
    text: 'Mitglied',
    value: 'mitglied',
  }
])

const nameRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte gib einen Namen an.'
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
  const isConfirmed = await createConfirm({
    title: 'User anlegen?',
    content: 'Bist Du sicher?',
  })
  if (!isConfirmed) return

  loading.value = true
  const { valid } = await form.value?.validate()
  if (!valid) {
    toast.info('Bitte überprüfe deine Angaben.')
    loading.value = false
    return
  }
  const auth = getAuth()
  const createUser = httpsCallable(functions, 'createUserWithLink')
  const a = await createUser({
    name: name.value,
    email: email.value,
    role: role.value,
    createdUserID: auth.currentUser.uid,
  })
    .catch((error) => {
      console.error(error)
      isActive.value = false
      loading.value = false
      toast.error(error.message)
      throw error
    })
  isActive.value = false
  loading.value = false
  form.value?.reset()
  toast.success('User erfolgreich angelegt.')
}

const onAbort = (isActive) => {
  isActive.value = false
  form.value?.reset()
}

</script>
