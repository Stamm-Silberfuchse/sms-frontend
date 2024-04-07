<template>
  <v-dialog v-if="!user?.disabled" v-model="showDialog" width="340">
    <template v-slot:activator>
      <v-tooltip location="start" text="Passwort setzen">
        <template v-slot:activator="{ props: tooltipProps }">
          <v-icon
            ref="activatorRef"
            v-bind="tooltipProps"
            color="primary"
            class="me-2"
            @click="showDialog = true"
          >
            mdi-key
          </v-icon>
        </template>
      </v-tooltip>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-form
          ref="form"
          v-model="valid"
          :loading="loading"
          lazy-validation
          @submit.prevent="onUpdateUserPassword(isActive)"
        >
          <v-card-title>
            Passwort setzen
          </v-card-title>
          <v-card-subtitle>
            Neues Passwort für '{{ user.name }}'
          </v-card-subtitle>
          <v-card-text>
            <v-text-field
              v-model="password"
              :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="visible ? 'text' : 'password'"
              placeholder="Passwort"
              counter
              required
              :rules="pwRules"
              class="pb-2 pt-4"
              @click:append-inner="visible = !visible"
            ></v-text-field>

            <v-text-field
              v-model="password2"
              :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="visible ? 'text' : 'password'"
              placeholder="Passwort wiederholen"
              counter
              required
              :rules="pw2Rules"
              class="pb-2"
              @click:append-inner="visible = !visible"
            ></v-text-field>
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
            >
              Speichern
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

import { useUsersStore } from '@/store/users'

const usersStore = useUsersStore()

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const createConfirm = useConfirm()

const loading = ref(false)

const showDialog = ref(false)

const visible = ref(false)

const password = ref('')
const password2 = ref('')

const form = ref(null)
const valid = ref(false)

const pwRules = ref([
  value => {
    if (value) return true
    return 'Bitte gib ein Passwort an.'
  },
  value => {
    if (value?.length > 9) return true
    return 'Das Passwort muss mindestens 10 Zeichen beinhalten.'
  },
])

const pw2Rules = ref([
  value => {
    if (value === password?.value) return true
    return 'Das Passwort stimmt nicht mit dem ersten überein.'
  },
])

const onUpdateUserPassword = async (uid) => {
  const { valid } = await form.value?.validate()
  if (!valid) {
    toast.info('Bitte überprüfe deine Angaben.')
    loading.value = false
    return
  }

  const isConfirmed = await createConfirm({
    title: 'Neues Passwort setzen?',
    content: 'Bist Du sicher?',
  })
  if (!isConfirmed) return

  loading.value = true
  const updateUser = httpsCallable(functions, 'updateUser')
  try {
    const payload = {
      password: password?.value,
    }
    await updateUser({ uid: props.user?.id, payload: payload })
    toast.success(`Passwort von '${usersStore.getByID(props.user?.id)?.name}' wurde gespeichert`)
    form.value?.reset()
  } catch (error) {
    toast.error(`Passwort von '${usersStore.getByID(props.user?.id)?.name}' konnte nicht gespeichert werden.`)
  }
  showDialog.value = false
  loading.value = false
}

const onAbort = () => {
  showDialog.value = false
  loading.value = false
  form.value?.reset()
}

</script>
