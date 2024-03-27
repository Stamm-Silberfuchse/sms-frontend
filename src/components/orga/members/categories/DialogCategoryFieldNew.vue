<template>
  <v-dialog width="340">
    <template v-slot:activator="{ props }">
      <v-btn
        prepend-icon="mdi-plus"
        size="small"
        border
        variant="text"
        v-bind="props"
        class="text-none mt-3"
      >
        Hinzufügen
      </v-btn>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-form
          ref="form"
          v-model="valid"
          fast-fail
          @submit.prevent="addField(isActive)"
        >
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
              :items="possibleFieldTypes"
              item-value="id"
              item-title="name"
              label="Typ"
              single-line
              hide-details
              return-object
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

import { useCategoriesStore } from '@/store/categories'
import { useFieldsStore } from '@/store/fields'

const categoriesStore = useCategoriesStore()
const fieldsStore = useFieldsStore()

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

const form = ref(null)
const valid = ref(false)
const fieldname = ref('')
const fieldtype = ref({ id: 'Text', name: 'Text' })

const possibleFieldTypes = ref([
  {
    id: 'Text',
    name: 'Text'
  },
  {
    id: 'Boolean',
    name: 'Ja/Nein'
  },
  {
    id: 'Gender',
    name: 'Geschlecht'
  },
  {
    id: 'Tel',
    name: 'Telefon'
  },
  {
    id: 'Email',
    name: 'E-Mail'
  },
  {
    id: 'Date',
    name: 'Datum'
  },
  {
    id: 'Time',
    name: 'Zeit'
  },
  {
    id: 'Datetime',
    name: 'Datum & Zeit'
  },
  {
    id: 'Number',
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
  let docFields = fieldsStore.getAllByCategoryID(props.categoryID)
  // check if element with same name already exists
  if(docFields.length > 0) {
    for (let i = 0; i < docFields.length; i++) {
      if(docFields[i].name === fieldname.value) {
        toast.error('Feld mit diesem Namen existiert bereits.')
        loading.value = false
        return
      }
    }
  }
  const payload = {
    name: fieldname.value,
    type: fieldtype.value.id,
    categoryID: props.categoryID,
    order: docFields.length
  }
  const docSnapshot = await fieldsStore.addField(payload)
    .catch((error) => {
      toast.error('Fehler beim Erstellen des Feldes.' + error)
      loading.value = false
      return
    })
  if (!!props.callbackFn) {
    props.callbackFn(docSnapshot)
  }
  isActive.value = false
  fieldname.value = ''
  fieldtype.value = { id: 'Text', name: 'Text' }
  loading.value = false
  toast.success('Feld erstellt.')
}
</script>
