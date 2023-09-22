<template>
  <v-data-table
    v-model="selected"
    :headers="headers"
    :items="members"
    :search="search"
    item-value="name"
    show-select
    class="elevation-1"
    v-model:sort-by="sortBy"
    :loading="loading"
  >

    <template v-slot:top>
      <v-toolbar class="px-4">
        <v-chip
          variant="elevated"
          :color="meute ? 'orange' : 'orange-lighten-4'"
          class="mr-2"
          @click="meute = !meute"
        >
          Meute
        </v-chip>
        <v-chip
          variant="elevated"
          :color="sippe ? 'blue-darken-4' : 'blue-lighten-4'"
          class="mr-2"
          @click="sippe = !sippe"
        >
          Sippe
        </v-chip>
        <v-chip
          variant="elevated"
          :color="rover ? 'red-darken-4' : 'red-lighten-4'"
          class="mr-2"
          @click="rover = !rover"
        >
          Rover
        </v-chip>
        <v-spacer />
        <v-text-field
          v-model="search"
          density="compact"
          label="Suche"
          single-line
          hide-details
        ></v-text-field>
      </v-toolbar>
    </template>

    <template v-slot:item.id="{ item }">
      <v-chip>
        M{{ item.columns.id }}
      </v-chip>
    </template>

    <template v-slot:item.actions="{ item }">
      <v-icon
        size="small"
        class="me-2"
        @click="viewMember(item.raw.id)"
      >
        mdi-eye
      </v-icon>
      <v-icon
        size="small"
        class="me-2"
        @click="editMember(item.raw.id)"
      >
        mdi-pencil
      </v-icon>
    </template>

    <template v-slot:no-data>
        Keine Daten vorhanden
    </template>
  </v-data-table>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/plugins/supabase'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const $route = useRoute()
const $router = useRouter()

const loading = ref(false)

const headers = ref([
  { title: 'M-Nr.', key: 'id' },
  { title: 'Nachname', key: 'LAST_NAME' },
  { title: 'Vorname', key: 'FIRST_NAME' },
  { title: 'Adresse', key: 'ADDRESS' },
  { title: 'PLZ', key: 'ZIP_CODE' },
  { title: 'Ort', key: 'CITY' },
  { title: '', key: 'actions', sortable: false, align: 'end' },
])
const selected = ref([])
const sortBy = ref([{ key: 'LAST_NAME', order: 'asc' }])

const members = ref([])
const members_general_fields = ref([])

const meute = ref(false)
const sippe = ref(false)
const rover = ref(false)

const search = ref('')

const fetchData = async () => {
  loading.value = true
  console.log("Fetching asynchronously...")

  // fetch all members
  await supabase.from('members').select('*').eq('archived', false)
    .then(async ({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        members.value = data
      }
    })
    .catch((error) => {
      toast.error(error.message)
    })

  // fetch all member fields of category BASIC_DATA
  let member_fields = []
  await supabase.from('member_fields').select('*').eq('category_id', 1).neq('type', 'PLACEHOLDER')
    .then(async ({ data, error, status }) => {
      if (error && status !== 406) throw error
      console.log(status, error, data)
      if(data) {
        members_general_fields.value = data
        member_fields = data.map(el => el.id)
        console.log(member_fields)
      }
    })
    .catch((error) => {
      console.error(error)
      toast.error(error.message)
    })

    // fetch all member data of category BASIC_DATA
    await supabase.from('members_data').select('*').in('member_field_id', member_fields)
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
          loading.value = false
        }
      })
      .catch((error) => {
        toast.error(error.message)
      })
}

fetchData()

const viewMember = (id) => {
  $router.push('/members/member/' + id)
}

const editMember = (id) => {
  $router.push('/members/member/' + id + '/edit')
}

</script>
