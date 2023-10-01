<template>
  <v-dialog width="300">
    <template v-slot:activator="{ props }">
      <v-btn
        icon
        variant="flat"
        v-bind="props"
      >
        <v-icon color="grey-lighten-1">
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
              @click.prevent="editCategory(isActive)"
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
import { supabase, getUser } from '@/plugins/supabase'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const props = defineProps({
  name: {
    type: String,
    default: ''
  },
  id: {
    type: Number,
    required: true
  },
  callbackFn: {
    type: Function,
    default: null
  }
})
const loading = ref(false)

const name = ref(props.name)

const categoryNameRules = ref([
  value => {
    if (value?.length > 0) return true

    return 'Bitte gib einen Namen für die Kategorie an.'
  },
])

const editCategory = async (isActive) => {
  loading.value = true
  const user = await getUser()

  await supabase.from('categories').upsert([
      {
        id: props.id,
        name: props.name,
        usr_id_create: user.id
      },
    ])
    .select()
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        toast.success('Kategorie wurde bearbeitet.')
        if( props.callbackFn != null ) {
          props.callbackFn(props.id, name.value)
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
