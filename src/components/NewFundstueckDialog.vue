<template>
  <v-dialog width="300">
    <template v-slot:activator="{ props }">
      <v-btn
        color="primary"
        v-bind="props"
        prependIcon="mdi-tag-plus-outline"
        class="mr-4 mb-4 text-none"
      >
        Einstellen
      </v-btn>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-form fast-fail ref="form">
          <v-card-title>
            Neues Fundstück
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="title"
              label="Titel"
              required
              autofocus
              :rules="titleRules"
            ></v-text-field>
            <v-text-field
              v-model="description"
              label="Beschreibung"
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
              :disabled="loading || !(title.length>0)"
              :loading="loading"
              color="primary"
              variant="elevated"
              class="text-none"
              type="submit"
              @click.prevent="createFundstueck(isActive)"
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
import { supabase } from '@/plugins/supabase'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { useAuthStore } from '@/store/auth'

const router = useRouter()

const authStore = useAuthStore()

const loading = ref(false)

const title = ref('')
const description = ref('')

const form = ref(null)

const titleRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte gib einen Titel an.'
  },
])

const createFundstueck = async () => {
  loading.value = true
  const { valid } = await form.value?.validate()
  if (!valid) {
    toast.info('Bitte überprüfe deine Angaben.')
    loading.value = false
    return
  }
  supabase
    .from('fundstuecke')
    .insert({
      title: title.value,
      description: description.value,
      usr_id_create: authStore.id,
    })
    .select()
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error

      if(data) {
        toast.success("Fundstück eingestellt.")
        router.push({ name: 'Fundstück bearbeiten', params: { id: data[0].id } })
      }
    })
    .catch((error) => {
      console.log(error)
      toast.error(error.message)
    })
}

</script>
