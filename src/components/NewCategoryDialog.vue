<template>
  <v-dialog width="300">
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
        <v-form fast-fail>
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
              :disabled="loading || (name.length === 0)"
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
import { supabase, getUser } from '@/plugins/supabase'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const loading = ref(false)
const name = ref('')
const categoryNameRules = ref([
  value => {
    if (value?.length > 0) return true

    return 'Bitte gib einen Namen für die Kategorie an.'
  },
])

const props = defineProps({
  callbackFn: Function,
})

const createCategory = async (isActive) => {
  loading.value = true
  const user = await getUser()

  await supabase.from('categories').insert([
      {
        name: name.value,
        usr_id_create: user.id
      },
    ])
    .select()
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        const newCategory = data
        toast.success('Kategorie wurde erstellt.')
        name.value = ''
        if( props.callbackFn != null ) {
          props.callbackFn(newCategory[0])
        }
      }
    })
    .catch((error) => {
      console.log(error)
      toast.error(error.message)
    })
    .finally(() => {
      loading.value = false
      isActive.value = false
    })
}
</script>
