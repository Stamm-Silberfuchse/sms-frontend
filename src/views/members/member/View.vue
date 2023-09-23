<template>
  <v-container>
    <PageTitle :back="true" :title="`${getMemberDataByFieldNameIntern('FIRST_NAME')} ${getMemberDataByFieldNameIntern('LAST_NAME')}`" />

    <v-row>
      <v-col cols="12" lg="4" md="6" justify="start" v-for="(category, i) in categories">
        <v-card class="my-2" width="100%">
          <v-card-text class="mb-6">
            <v-card-title class="text-h5 text--primary mb-5">
              {{ category.name }}
            </v-card-title>
            <v-row
              v-for="(field, k) in fieldsByCategory(category.id)"
              :key="`${i}-${field.id}`"
            >
              <v-col cols="6" class="py-1 pr-0">
                <v-card-text class="text-body-1 font-weight-bold py-0">
                  {{ field.name }}:
                </v-card-text>
              </v-col>
              <v-col cols="6" class="py-1 pl-0">
                <v-card-text class="text-body-1 py-0">
                  {{ getMemberDataByFieldID(field.id) }}
                </v-card-text>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/plugins/supabase'
import { useRoute } from 'vue-router'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import MembersTable from '@/components/MembersTable.vue'
import PageTitle from '@/components/PageTitle.vue'

const $route = useRoute()

const loading = ref(false)

const member = ref([])
const categories = ref([])
const fields = ref([])

const fetchData = async() => {
  loading.value = true
  console.log("Fetching synchronously...")

  // fetch all member fields
  const promise1 = supabase.from('member_fields').select('id, cat_id, type, name_intern, name').neq('type', 'PLACEHOLDER')
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        fields.value = data
      }
    })
    .catch((error) => {
      toast.error(error.message)
    })

  // fetch all categories
  const promise2 = supabase.from('categories').select('id, uuid, name, name_intern')
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        categories.value = data
      }
    })
    .catch((error) => {
      console.error(error)
      toast.error(error.message)
    })

  // fetch all member data of member
  const promise3 = supabase.from('members_data').select('*').eq('member_id', $route.params.id)
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        member.value = data
      }
    })
    .catch((error) => {
      toast.error(error.message)
    })

  Promise.all([promise1, promise2, promise3]).then((values) => {
    console.log(categories.value)
    loading.value = false
  })
}

fetchData()

const fieldsByCategory = (cat_id) => {
  return fields.value.filter(el => el.cat_id === cat_id)
}

const getMemberDataByFieldID = (field_id) => {
  return loading.value ? '...' : member?.value?.find(el => el?.member_field_id === field_id)?.value
}

const getMemberDataByFieldNameIntern = (name_intern) => {
  const field_id = fields?.value?.find(el => el.name_intern === name_intern)?.id
  const data = member?.value?.find(el => el?.member_field_id === field_id)?.value
  return data ? data : '...'
}

const goToSettings = () => {
  toast.info('Not implemented yet')
}
</script>
