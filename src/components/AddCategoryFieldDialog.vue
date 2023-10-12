<template>
  <v-dialog width="300">
    <template v-slot:activator="{ props }">
      <v-btn
        icon
        variant="flat"
        v-bind="props"
      >
        <v-icon color="grey-lighten-1">
          mdi-plus
        </v-icon>
      </v-btn>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-form fast-fail>
          <v-card-title>
            Feld erstellen
          </v-card-title>
          <v-card-subtitle>
            in Kategorie "{{ props.categoryName }}"
          </v-card-subtitle>
          <v-card-text>
            <v-text-field
              v-model="fieldname"
              label="Feldname"
              required
              autofocus
              :rules="categoryNameRules"
            ></v-text-field>
            <v-select
              v-model="fieldtype"
              @update:model-value="updateValue($event, field)"
              :items="possibleCategories"
              item-value="id"
              item-title="name"
              label="Typ"
              single-line
              hide-details
              :menu-props="{
                closeOnClick: true,
                closeOnContentClick: true,
                }"
            ></v-select>
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
              :disabled="loading || (fieldname.length === 0)"
              :loading="loading"
              color="primary"
              variant="elevated"
              class="text-none"
              type="submit"
              @click.prevent="addField(isActive)"
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

import { useAuthStore } from '@/store/auth'

const props = defineProps({
  categoryName: {
    type: String,
    default: ''
  },
  categoryID: {
    type: Number,
    required: true
  },
  callbackFn: {
    type: Function,
    default: null
  }
})
const loading = ref(false)

const authStore = useAuthStore()

const fieldname = ref('')
const fieldtype = ref(null)

const possibleCategories = ref([
  {
    id: 'TEXT',
    name: 'Text'
  },
  {
    id: 'BOOL',
    name: 'Ja/Nein'
  },
  {
    id: 'GENDER',
    name: 'Geschlecht'
  },
  {
    id: 'PHONE',
    name: 'Telefon'
  },
  {
    id: 'EMAIL',
    name: 'E-Mail'
  },
  {
    id: 'DATE',
    name: 'Datum'
  },
  {
    id: 'TIME',
    name: 'Zeit'
  },
  {
    id: 'DATETIME',
    name: 'Datum & Zeit'
  },
  {
    id: 'NUMBER',
    name: 'Zahl'
  }
])

const categoryNameRules = ref([
  value => {
    if (value?.length > 0) return true

    return 'Bitte gib einen Namen für das Feld an.'
  },
])

const addField = async (isActive) => {
  loading.value = true


  await supabase.from('member_fields').insert([
      {
        cat_id: props.categoryID,
        name: fieldname.value,
        type: fieldtype.value,
        name_intern: 'user-defined',
        usr_id_create: authStore.id,
        timestamp_create: new Date()
      },
    ])
    .select()
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        toast.success('Feld wurde erstellt.')
        if( props.callbackFn != null ) {
          props.callbackFn(props.categoryID, fieldname.value, fieldtype.value)
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
