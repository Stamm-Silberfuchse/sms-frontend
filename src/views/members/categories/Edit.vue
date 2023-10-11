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
      <v-col cols="12" lg="4" md="6" justify="start" v-for="(category, i) in categories.a">
        <v-card width="100%">
          <v-card-text class="mb-6">
            <v-card-title class="text-h5 text--primary mb-5">
              <v-row class="mx-0 mt-0 pb-2">
                {{ category.name }}
                <v-spacer></v-spacer>
                <EditCategoryDialog :id="category.id" :name="category.name" :callbackFn="editCategoryLocal" />
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
            >
              <v-col cols="8" class="py-1 pr-0">
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
              <v-col cols="4" class="py-1 pl-0">
                <v-text-field
                  v-model="formData[category.id]['fields'][field.id]['type']"
                  @update:model-value="updateValue($event, field)"
                  density="compact"
                  variant="solo"
                  label="Typ"
                  single-line
                  hide-details
                  class="pr-4 pl-0"
                ></v-text-field>
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

const loading = ref(false)
const categories = reactive({ a: [ { name: '' } ] })
const fields = ref([])

const formData = ref({})

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
          formData.value[el.id] = {
            uuid: el.uuid,
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
          let initial_value = ''
          // TODO: convert to matching type
          if(el.type === 'BOOL') {
            initial_value = false
          }
          formData.value[el?.cat_id]["fields"][el?.id] = {
            value: initial_value,
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
  console.log('editCategoryLocal', newCategory)
  categories.a.push(newCategory)
  // fetchData()
}

const editCategoryLocal = (id, name) => {
  categories.a.find(item => item.id === id).name = name
}

const formDataFieldsByCategory = (cat_id) => {
  if(formData.value[cat_id] === undefined) return []
  return Object.keys(formData.value[cat_id]?.fields)
    .map(id => ({ id, ...formData.value[cat_id]?.fields[id] }))
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
</script>
