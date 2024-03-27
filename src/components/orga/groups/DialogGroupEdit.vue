<template>
  <v-dialog width="340">
    <template v-slot:activator="{ props }">
      <v-btn
        icon
        size="x-small"
        variant="flat"
        v-bind="props"
      >
        <v-icon size="x-large">
          mdi-pencil
        </v-icon>
      </v-btn>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-form fast-fail>
          <v-card-title>
            Kategorie bearbeiten
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="name"
              label="Name"
              required
              :rules="categoryNameRules"
            ></v-text-field>
            <v-text-field
              v-model="color"
              label="Farbe"
              type="color"
              required
              :rules="colorRules"
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
              :disabled="loading || (name.length === 0)"
              :loading="loading"
              color="primary"
              variant="elevated"
              class="text-none"
              type="submit"
              @click.prevent="editGroup(isActive)"
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
import { ref } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useGroupsStore } from '@/store/groups'

const groupsStore = useGroupsStore()

const props = defineProps({
  id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: ''
  },
  callbackFn: {
    type: Function,
    default: null
  }
})

const loading = ref(false)

const name = ref(props.name)
const color = ref(props.color)

const categoryNameRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte gib einen Namen für die Gruppe an.'
  },
])
const colorRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte gib eine Farbe für die Gruppe an.'
  },
])

const editGroup = async (isActive) => {
  loading.value = true
  const payload = {
    name: name.value,
    color: color.value
  }
  await groupsStore.updateGroup(props.id, payload)
    .catch((error) => {
      toast.error(error.message)
      loading.value = false
      return
    })
  if(!!props.callbackFn) {
    props.callbackFn(props.id, name.value, color.value)
  }
  isActive.value = false
  loading.value = false
  toast.success('Gruppe geändert.')
}
</script>
