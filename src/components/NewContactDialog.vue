<template>
  <v-dialog width="340">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        prependIcon="mdi-account-plus"
        class="mr-4 mb-4 text-none"
      >
        Kontakt anlegen
      </v-btn>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-form fast-fail>
          <v-card-title>
            Kontakt anlegen
          </v-card-title>
          <v-card-subtitle>
            für {{ props.memberName }}
          </v-card-subtitle>
          <v-card-text>
            <v-text-field
              v-model="name"
              label="Name"
              required
              autofocus
              :rules="nameRules"
            ></v-text-field>
            <v-combobox
              v-model="relationship"
              label="Beziehung"
              :items="relationshipChoices"
            ></v-combobox>
            <v-combobox
              v-model="type"
              label="Kontakttyp"
              :items="typeChoices"
            ></v-combobox>
            <v-text-field
              v-model="data"
              :label="type"
              :rules="nameRules"
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
              :disabled="loading || (data?.length === 0)"
              :loading="loading"
              color="primary"
              variant="elevated"
              class="text-none"
              type="submit"
              @click.prevent="addContact(isActive)"
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
import { supabase } from '@/plugins/supabase'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useAuthStore } from '@/store/auth'

const props = defineProps({
  memberName: {
    type: String,
    required: true
  },
  memberID: {
    type: String,
    required: true
  }
})
const loading = ref(false)

const authStore = useAuthStore()

const name = ref('')
const relationship = ref('')
const type = ref('E-Mail')
const data = ref('')

const relationshipChoices = ref([
  'Mutter',
  'Vater',
  'Oma',
  'Opa',
  'Tante',
  'Onkel',
  'Freund*in',
  'Bekannte*r',
  'Nachbar*in'
])

const typeChoices = ref([
  'E-Mail',
  'Telefon'
])

const nameRules = ref([
  value => {
    if (value?.length > 0) return true

    return 'Bitte gib einen Namen für den Kontakt an.'
  },
])

const addContact = async (isActive) => {
  loading.value = true

  await supabase.from('contacts').insert([
      {
        member_id: props.memberID,
        name: name.value,
        relationship: relationship.value,
        type: type.value,
        data: data.value,
        usr_id_create: authStore.id,
        timestamp_create: new Date()
      },
    ])
    .select()
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        toast.success('Kontakt wurde erstellt.')
        toast.info('Weiterleitung implementieren...')
        name.value = ''
        relationship.value = ''
        type.value = 'E-Mail'
        data.value = ''
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
