<template>
  <v-container>
    <PageTitle :back="true" :title="`${getMemberDataByFieldNameIntern('FIRST_NAME')} ${getMemberDataByFieldNameIntern('LAST_NAME')}`" />

    <v-col>
      <v-row justify="start" v-for="(category, i) in categories">
        <v-card class="my-2" width="100%">
          <v-card-item>
            <v-card-title>
              {{ category.name }}
            </v-card-title>
          </v-card-item>
          <v-card-text>
            <div v-for="(field, k) in fieldsByCategory(category.id)" :key="`${i}-${field.id}`">
              <v-text-field
                v-if="field.type === 'TEXT'"
                :label="field.name"
                v-model="formData[category.name_intern][field.name_intern]"
              ></v-text-field>
              <v-checkbox
                v-else-if="field.type === 'BOOL'"
                :label="field.name"
                v-model="formData[category.name_intern][field.name_intern]"
              ></v-checkbox>
            </div>
          </v-card-text>
        </v-card>
      </v-row>
    </v-col>
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

const formData = ref({})

const fetchData = async() => {
  loading.value = true
  console.log("Fetching synchronously...")

  // fetch all categories
  await supabase.from('categories').select('id, uuid, name, name_intern')
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        categories.value = data
        data.forEach((el) => {
          formData.value[el.name_intern] = {}
        })
      }
    })
    .catch((error) => {
      console.error(error)
      toast.error(error.message)
    })
  console.log("Categories fetched")

  // fetch all member_fields
  await supabase.from('member_fields').select('*').neq('type', 'PLACEHOLDER')
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        fields.value = data
        data.forEach((el) => {
          const cat = categories.value.find((c) => c.id === el.category_id)?.name_intern
          let initial_value = ''
          if(el.type === 'BOOL') {
            initial_value = false
          }
          formData.value[cat][el.name_intern] = initial_value
        })
      }
    })
    .catch((error) => {
      toast.error(error.message)
    })

  // fetch all members_data of member
  await supabase.from('members_data').select('*').eq('member_id', $route.params.id)
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        console.log(data)
        data.forEach((el) => {
          const field = fields.value.find((f) => f.id === el.member_field_id)
          const cat = categories.value.find((c) => c.id === field.category_id)?.name_intern
          let value = el.value
          if(field.type === 'BOOL') {
            value = JSON.parse(el.value)
          }
          formData.value[cat][field.name_intern] = value
        })
        member.value = data
      }
    })
    .catch((error) => {
      toast.error(error.message)
    })
}

fetchData()

const fieldsByCategory = (category_id) => {
  return fields.value.filter(el => el.category_id === category_id)
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
