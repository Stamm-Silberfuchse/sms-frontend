<template>
  <v-data-table
    v-model="selected"
    :headers="headers"
    :items="membersFiltered"
    :search="search"
    item-value="id"
    return-object
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
        <v-checkbox
          label="alle anzeigen"
          v-model="showAll"
          class="pt-5"
        ></v-checkbox>
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
      <v-chip
        class="ma-2"
        variant="outlined"
        color="primary"
        label
      >
      M{{ item.columns.id }}
      </v-chip>
    </template>

    <template v-slot:item.FIRST_NAME="{ item }">
      <router-link
        style="text-decoration: none;"
        class="text-primary"
        tag="a"
        :to="{ name: 'Mitglied ansehen', params: { id: item.raw.id } }"
      >
        {{ item.columns.FIRST_NAME }}
      </router-link>
    </template>

    <template v-slot:item.LAST_NAME="{ item }">
      <router-link
        style="text-decoration: none;"
        class="text-primary"
        tag="a"
        :to="{ name: 'Mitglied ansehen', params: { id: item.raw.id } }"
      >
        {{ item.columns.LAST_NAME }}
      </router-link>
    </template>

    <template v-slot:item.GENDER="{ item }">
      <v-icon>
        {{ getGenderIcon(item.raw.GENDER) }}
      </v-icon>
    </template>

    <template v-slot:item.actions="{ item }">
      <v-icon
        size="small"
        class="me-2"
        @click="editMember(item.raw.id)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        size="small"
        class="me-2"
        @click="archiveMember(item.raw.id)"
      >
        mdi-delete
      </v-icon>
    </template>

    <template v-slot:no-data>
        Keine Daten vorhanden
    </template>
  </v-data-table>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/plugins/supabase'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { parseField } from '@/plugins/sms-helper'

const $router = useRouter()

const loading = ref(false)

const headers = ref([
  { title: 'M-Nr.', key: 'id' },
  { title: 'Geschlecht', key: 'GENDER' },
  { title: 'Nachname', key: 'LAST_NAME' },
  { title: 'Vorname', key: 'FIRST_NAME' },
  { title: 'Adresse', key: 'ADDRESS' },
  { title: 'PLZ', key: 'ZIP_CODE' },
  { title: 'Ort', key: 'CITY' },
  { title: 'Geburtstag', key: 'BIRTHDAY' },
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
const showAll = ref(false)
const loadedAll = ref(false)

const fetchData = async (all=false) => {
  loading.value = true

  // fetch all members
  const query_eq = all ? '' : 'archived'
  await supabase.from('members').select('*').eq(query_eq, false).order('id', { ascending: true })
    .then(async ({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        members.value = data
      }
    })
    .catch((error) => {
      console.error(error)
      toast.error(error.message)
    })

  // fetch all member fields of category BASIC_DATA
  let member_fields = []
  await supabase.from('member_fields').select('*').eq('cat_id', 1).neq('type', 'PLACEHOLDER')
    .then(async ({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        members_general_fields.value = data
        member_fields = data.map(el => el.id)
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
        console.error(error)
        toast.error(error.message)
      })
}

fetchData()

const getGenderIcon = (value) => {
  switch(value) {
    case "M": return 'mdi-gender-male'
    case "W": return 'mdi-gender-female'
    case "D": return 'mdi-gender-non-binary'
    default: return 'mdi-minus'
  }
}

const viewMember = (id) => {
  $router.push('/members/member/' + id)
}

const editMember = (id) => {
  $router.push('/members/member/' + id + '/edit')
}

const archiveMember = (id) => {
  toast.error("Archivieren noch nicht implementiert.")
}

const membersFiltered = computed(() => {
  return members.value.filter((el) => {
    if(!showAll.value && el.archived) return false
    return true
  })
})

const rowClick = (event, data) => {
  viewMember(data.item.raw.id)
}

watch(showAll, (value) => {
  if(showAll && !loadedAll.value) {
    fetchData(true)
    loadedAll.value = true
  }
})

</script>
