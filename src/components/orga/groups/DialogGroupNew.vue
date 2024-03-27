<template>
  <v-dialog width="340">
    <template v-slot:activator="{ props }">
      <v-btn
        color="primary"
        v-bind="props"
        prependIcon="mdi-account-multiple-plus"
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
            Neue Gruppe
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="groupName"
              label="Gruppenname"
              required
              :rules="groupNameRules"
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
              :disabled="loading || !valid"
              :loading="loading"
              color="primary"
              variant="elevated"
              class="text-none"
              type="submit"
              @click.prevent="createGroup(isActive)"
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

import { useGroupsStore } from '@/store/groups'

const props = defineProps({
  callbackFn: {
    type: Function,
    default: null
  }
})

const router = useRouter()

const groupsStore = useGroupsStore()

const loading = ref(false)

const groupName = ref('')

const form = ref(null)
const valid = ref(false)

const groupNameRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte gib einen Namen für die Gruppe an.'
  },
])

const createGroup = async (isActive) => {
  loading.value = true
  const { valid } = await form.value?.validate()
  if (!valid) {
    toast.info('Bitte überprüfe deine Angaben.')
    loading.value = false
    return
  }
  const uid = await groupsStore.addGroup({
    name: groupName.value,
    children: [],
    color: '#000000',
  })
  if(!!props.callbackFn) props.callbackFn()
  toast.success("Gruppe angelegt.")
  loading.value = false
  form.value?.reset()
  isActive.value = false
}

</script>
