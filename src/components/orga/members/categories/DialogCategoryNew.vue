<template>
  <v-dialog width="340" @click:outside="resetForm">
    <template v-slot:activator="{ props }">
      <v-btn
        color="primary"
        v-bind="props"
        prependIcon="mdi-plus"
        class="mr-4 mb-4 text-none"
      >
        Kategorie erstellen
      </v-btn>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-form v-model="valid" fast-fail ref="form">
          <v-card-title>
            Neue Kategorie
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="name"
              label="Name"
              required
              autofocus
              :rules="categoryNameRules"
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
              @click.prevent="createCategory(isActive)"
            >
              Erstellen
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

import { useCategoriesStore } from '@/store/categories'

const categoriesStore = useCategoriesStore()

const loading = ref(false)
const name = ref('')
const form = ref(null)
const valid = ref(false)

const categoryNameRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte gib einen Namen für die Kategorie an.'
  },
])

const props = defineProps({
  onAddCategoryCallback: {
    type: Function,
    default: null,
  },
})

const resetForm = () => {
  form.value.reset()
}

const createCategory = async (isActive) => {
  loading.value = true
  const { valid } = await form.value?.validate()
  if (!valid) {
    toast.info('Bitte überprüfe deine Angaben.')
    loading.value = false
    return
  }
  const newDoc = await categoriesStore.addCategory({
    name: name.value,
    fields: [],
    order: categoriesStore.getAll.length
  })
  if (!!props.onAddCategoryCallback) {
    props.onAddCategoryCallback(newDoc)
  }
  loading.value = false
  isActive.value = false
  name.value = ''
  toast.success('Kategorie wurde erstellt.')
}
</script>
