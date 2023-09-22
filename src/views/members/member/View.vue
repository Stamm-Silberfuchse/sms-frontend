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
              {{ field.name }}: {{ getMemberDataByFieldID(field.id) }}
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

const fetchData = async() => {
  loading.value = true
  console.log("Fetching synchronously...")

  // fetch all member fields
  const promise1 = supabase.from('member_fields').select('id, category_id, type, name_intern, name').neq('type', 'PLACEHOLDER')
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
