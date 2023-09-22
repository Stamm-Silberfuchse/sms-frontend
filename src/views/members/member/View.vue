<template>
  <Suspense>
    <!-- component with nested async dependencies -->
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

    <!-- loading state via #fallback slot -->
    <template #fallback>
      Loading...
    </template>
  </Suspense>
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
  const promise1 = await supabase
    .from('member_fields')
    .select('id, category_id, type, name_intern, name')
    .eq('org_id', 1) // TODO: organization
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        fields.value = data
      }
    })
    .catch((error) => {
      toast.error(error.message)
    })
    .finally(() =>{
      loading.value = false
    })
  const promise2 = supabase
    .from('categories')
    .select('id, uuid, name, name_intern')
    .eq('org_id', 1) // TODO: organization
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error

      if(data) {
        categories.value = data
      }
    })
    .catch((error) => {
      toast.error(error.message)
    })
    .finally(() =>{
      loading.value = false
    })
  const promise3 = supabase
    .from('members_data')
    .select('*')
    .eq('member_id', $route.params.id)
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error

      if(data) {
        member.value = data
      }
    })
    .catch((error) => {
      toast.error(error.message)
    })
    .finally(() =>{
      loading.value = false
    })

  Promise.all([promise1, promise2, promise3]).then((values) => {
    loading.value = false
    return
  })
}

await fetchData()

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
