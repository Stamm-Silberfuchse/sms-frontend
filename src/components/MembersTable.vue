<template>
  <v-data-table
    v-model="selected"
    :headers="headers"
    :items="members"
    item-value="name"
    show-select
    class="elevation-1"
    :loading="loading"
  ></v-data-table>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/plugins/supabase'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const $route = useRoute()

const loading = ref(false)

const headers = ref([])

const members = ref([])
const members_general_fields = ref([])


const fetchData = async() => {
  loading.value = true
  console.log("Fetching...")

  await supabase
    .from('members')
    .select('*')
    .then(async ({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        members.value = data
      }
    })
    .catch((error) => {
      toast.error(error.message)
    })
    .finally(() =>{
      return
      loading.value = false
    })

  await supabase
    .from('member_fields')
    .select('*')
    .eq('org_id', 1) // TODO: organization
    .eq('category_id', 1) // only grab BASIC_DATA
    .then(async ({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        members_general_fields.value = data
        const member_fields = data.map(el => el.id)
        console.log(members_general_fields.value)
        members_general_fields.value.forEach((el) => {
          headers.value.push({
            title: el.name,
            key: el.name_intern,
          })
        })
        await supabase
          .from('members_data')
          .select('*')
          .in('member_field_id', member_fields) // only grab BASIC_DATA
          .then(async ({ data, error, status }) => {
            if (error && status !== 406) throw error
            if(data) {
              data.forEach((el) => {
                const member_index = members?.value?.findIndex((member) => member.id === el.member_id)
                if(member_index !== -1) {
                  const field_index = members_general_fields?.value?.findIndex((field) => field.id === el.member_field_id)
                  if(field_index !== -1) {
                    members.value[member_index][members_general_fields.value[field_index].name_intern] = el.value
                  }
                }
              })
            }
          })
          .catch((error) => {
            toast.error(error.message)
          })
          .finally(() =>{
            loading.value = false
          })
      }
    })
    .catch((error) => {
      toast.error(error.message)
    })
    .finally(() =>{
      loading.value = false
    })
}

await fetchData()

</script>

<script>
  export default {
    data () {
      return {
        selected: [],
        headers: [
          {
            title: 'Dessert (100g serving)',
            align: 'start',
            sortable: false,
            key: 'name',
          },
          { title: 'Calories', key: 'calories' },
          { title: 'Fat (g)', key: 'fat' },
          { title: 'Carbs (g)', key: 'carbs' },
          { title: 'Protein (g)', key: 'protein' },
          { title: 'Iron (%)', key: 'iron' },
        ],
        desserts: [
          {
            name: 'Frozen Yogurt',
            calories: 159,
            fat: 6.0,
            carbs: 24,
            protein: 4.0,
            iron: 1,
          },
          {
            name: 'Ice cream sandwich',
            calories: 237,
            fat: 9.0,
            carbs: 37,
            protein: 4.3,
            iron: 1,
          },
          {
            name: 'Eclair',
            calories: 262,
            fat: 16.0,
            carbs: 23,
            protein: 6.0,
            iron: 7,
          },
          {
            name: 'Cupcake',
            calories: 305,
            fat: 3.7,
            carbs: 67,
            protein: 4.3,
            iron: 8,
          },
          {
            name: 'Gingerbread',
            calories: 356,
            fat: 16.0,
            carbs: 49,
            protein: 3.9,
            iron: 16,
          },
          {
            name: 'Jelly bean',
            calories: 375,
            fat: 0.0,
            carbs: 94,
            protein: 0.0,
            iron: 0,
          },
          {
            name: 'Lollipop',
            calories: 392,
            fat: 0.2,
            carbs: 98,
            protein: 0,
            iron: 2,
          },
          {
            name: 'Honeycomb',
            calories: 408,
            fat: 3.2,
            carbs: 87,
            protein: 6.5,
            iron: 45,
          },
          {
            name: 'Donut',
            calories: 452,
            fat: 25.0,
            carbs: 51,
            protein: 4.9,
            iron: 22,
          },
          {
            name: 'KitKat',
            calories: 518,
            fat: 26.0,
            carbs: 65,
            protein: 7,
            iron: 6,
          },
        ],
      }
    },
  }
</script>
