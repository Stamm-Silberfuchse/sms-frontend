<template>
  <v-dialog width="400">
    <template v-slot:activator="{ props }">
      <v-btn
        color="primary"
        v-bind="props"
        prependIcon="mdi-playlist-plus"
        class="mr-4 mb-4 text-none"
      >
        Neue Liste erstellen
      </v-btn>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-form
          ref="form"
          v-model="valid"
          :loading="loading"
          lazy-validation
          @submit.prevent="onCreateList(isActive)"
        >
          <v-card-title>
            Liste erstellen
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

import { useMemberListsStore } from '@/store/member_lists'

const memberListsStore = useMemberListsStore()

const props = defineProps({
  onListCreatedCallbackFn: {
    type: Function,
    required: true,
  }
})

const loading = ref(false)

const name = ref('')

const form = ref(null)
const valid = ref(false)

const nameRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte gib einen Namen für die Liste an.'
  },
])

const onCreateList = async (isActive) => {
  loading.value = true
  const { valid } = await form.value?.validate()
  if (!valid) {
    toast.info('Bitte überprüfe deine Angaben.')
    loading.value = false
    return
  }
  const payload = {
    name: name.value,
    items: [],
    default: false
  }
  try {
    const newListID = await memberListsStore.addMemberList(payload)
    props.onListCreatedCallbackFn(newListID)
    toast.success('Liste erfolgreich erstellt.')
  } catch (error) {
    toast.error('Fehler beim Anlegen der Liste.')
  } finally {
    isActive.value = false
    loading.value = false
    form.value?.reset()
  }
}

const onAbort = (isActive) => {
  isActive.value = false
  form.value?.reset()
}

</script>
