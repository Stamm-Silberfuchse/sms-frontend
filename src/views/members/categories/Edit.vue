<template>
  <v-container>
    <PageTitle title="Kategorien & Felder" :loading="loading" back>
      <v-col>
        <v-icon
        class="pt-1"
        icon="mdi-badge-account-horizontal"
        size="large"
        color="primary"
      />
      </v-col>
    </PageTitle>

    <!-- Buttons -->
    <v-row justify="start" class="mx-0 pt-0 px-3 pb-3">
      <NewCategoryDialog :callbackFn="addCategoryLocal" />
    </v-row>

    <!-- Categories -->
    <v-row
      v-if="!loading"
      justify="start"
      class="mx-0 mt-0 mb-4"
      style="padding-left: -20px;"
    >
      <v-col cols="12" md="6" justify="start" v-for="(category, i) in categories.a">
        <v-card width="100%">
          <v-card-text class="mb-6">
            <v-card-title class="text-h5 text--primary mb-5">
              <v-row class="mx-0 mt-0 pb-2">
                {{ category.name }}
                <v-spacer></v-spacer>
                <NewCategoryFieldDialog
                  :categoryName="category.name"
                  :categoryID="category.id"
                  :callbackFn="addFieldLocal"
                />
                <EditCategoryDialog
                  :id="category.id"
                  :name="category.name"
                  :callbackFn="editCategoryLocal"
                />
                <v-btn
                  icon
                  variant="flat"
                  @click="deleteCategory(category.id)"
                >
                  <v-icon color="grey-lighten-1">
                    mdi-delete
                  </v-icon>
                </v-btn>
              </v-row>
            </v-card-title>
            <v-row
              v-for="(field, k) in formDataFieldsByCategory(category.id)"
              :key="`${i}-${field.id}`"
              class="px-3"
              justify="center"
            >
              <v-col cols="1" class="py-1 px-0" align="center">
                <v-icon color="grey-lighten-1 my-auto">
                  mdi-dots-vertical
                </v-icon>
              </v-col>
              <v-col cols="7" class="py-1 px-0">
                <v-text-field
                  v-model="formData[category.id]['fields'][field.id]['name']"
                  @update:model-value="updateValue($event, field)"
                  density="compact"
                  variant="solo"
                  label="Feldname"
                  single-line
                  hide-details
                  class="px-4"
                ></v-text-field>
              </v-col>
              <v-col cols="3" class="py-1 px-0">
                <v-select
                  v-model="formData[category.id]['fields'][field.id]['type']"
                  @update:model-value="updateValue($event, field)"
                  :items="possibleFieldTypes"
                  item-value="id"
                  item-title="name"
                  density="compact"
                  variant="solo"
                  label="Typ"
                  single-line
                  hide-details
                  class="pr-4 pl-0"
                  :menu-props="{
                    closeOnClick: true,
                    closeOnContentClick: true,
                    }"
                ></v-select>
              </v-col>
              <v-col cols="1" class="py-1 pl-0">
                <v-btn
                  icon
                  variant="flat"
                  @click="deleteField(field.id, category.id)"
                >
                  <v-icon color="grey-lighten-1">
                    mdi-window-close
                  </v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { supabase } from '@/plugins/supabase'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import PageTitle from '@/components/PageTitle.vue'
import NewCategoryDialog from '@/components/NewCategoryDialog.vue'
import EditCategoryDialog from '@/components/EditCategoryDialog.vue'
import NewCategoryFieldDialog from '@/components/NewCategoryFieldDialog.vue'

const loading = ref(false)
const categories = reactive({ a: [ { name: '' } ] })
const fields = ref([])

const formData = reactive({})

const possibleFieldTypes = ref([
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

const fetchData = async() => {
  loading.value = true
  console.log("Fetching synchronously...")

  // fetch all categories
  await supabase.from('categories').select('*')
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        categories.a = data
        data.forEach((el) => {
          formData[el.id] = {
            name: el.name,
            name_intern: el.name_intern,
            fields: {}
          }
        })
      }
    })
    .catch((error) => {
      console.error(error)
      toast.error(error.message)
    })

  // fetch all member_fields
  await supabase.from('member_fields').select('*').neq('type', 'PLACEHOLDER')
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        fields.value = data
        data.forEach((el) => {
          formData[el?.cat_id]["fields"][el?.id] = {
            type: el.type,
            name: el.name,
            field_name_intern: el.name_intern
          }
        })
      }
    })
    .catch((error) => {
      toast.error(error.message)
    })
    .finally(() => {
      loading.value = false
    })
}

fetchData()

const addCategoryLocal = (newCategory) => {
  categories.a.push(newCategory)
  formData[newCategory.id] = {
    name: newCategory.name,
    name_intern: newCategory.name_intern,
    fields: {}
  }
}

const editCategoryLocal = (id, name) => {
  categories.a.find(item => item.id === id).name = name
}

const addFieldLocal = (cat_id, field_id, name, type) => {
  formData[cat_id]["fields"][field_id] = {
    type: type,
    name: name
  }
}

const formDataFieldsByCategory = (cat_id) => {
  if(formData[cat_id] === undefined) return []
  return Object.keys(formData[cat_id]?.fields)
    .map(id => ({ id, ...formData[cat_id]?.fields[id] }))
}

const deleteCategory = (id) => {
  supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .then(async ({ error }) => {
      if(error) {
        console.error(error)
        toast.error(error.message)
      } else {
        categories.a = categories.a.filter(item => item.id !== id)
        toast.success('Kategorie gelöscht.')
      }
    })
}

const deleteField = (fieldID, categoryID) => {
  supabase
    .from('member_fields')
    .delete()
    .eq('id', fieldID)
    .then(async ({ error }) => {
      if(error) {
        console.error(error)
        toast.error(error.message)
      } else {
        delete formData[categoryID].fields[fieldID]
        toast.success('Feld gelöscht.')
      }
    })
}
</script>
