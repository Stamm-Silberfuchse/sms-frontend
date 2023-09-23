<template>
  <v-container>
    <PageTitle
      :back="true"
      :title="`${getMemberDataByFieldNameIntern('FIRST_NAME')} ${getMemberDataByFieldNameIntern('LAST_NAME')}`"
      :loading="loading"
    >
      <v-chip
        class="ma-2"
        variant="outlined"
        color="primary"
        label
      >
        M{{ $route.params.id }}
      </v-chip>
      <v-chip
        class="ma-2"
        variant="flat"
        text-color="white"
      >
        inaktiv
      </v-chip>
      <v-chip
        class="ma-2"
        variant="flat"
        color="orange"
      >
        Meute
      </v-chip>
      <v-chip
        class="ma-2"
        variant="flat"
        color="blue-darken-4"
      >
        Sippe
      </v-chip>
      <v-chip
        class="ma-2"
        variant="flat"
        color="red-darken-4"
      >
        Rover
      </v-chip>
      <v-chip
        class="ma-2"
        variant="flat"
        color="yellow-darken-4"
        prependIcon="mdi-crown"
      >
        StaFü
      </v-chip>
    </PageTitle>

    <v-row justify="start" class="mx-0 pt-0 px-3">
      <v-btn
        color="primary"
        prependIcon="mdi-content-save"
        class="mr-4 mb-4 text-none"
        @click="saveMember"
      >
        Speichern
      </v-btn>
      <v-btn
        @click="goToSettings"
        prependIcon="mdi-email-edit-outline"
        class="mr-4 mb-4 text-none"
      >
        E-Mail-Einstellungen
      </v-btn>
    </v-row>

    <v-row
      justify="start"
      class="mx-0 mt-0 mb-4"
      style="padding-left: -20px;"
    >
      <v-col cols="12" lg="4" md="6" justify="start" v-for="(category, i) in categories">
        <v-card class="my-2" width="100%">
          <v-card-text class="mb-6">
            <v-card-title class="text-h5 text--primary mb-5">
              {{ category.name }}
            </v-card-title>
            <v-row
              v-for="(field, k) in formDataFieldsByCategory(category.id)"
              :key="`${i}-${field.id}`"
            >
              <v-col cols="12" class="py-1 px-7">
                <v-checkbox
                  v-if="field.type === 'BOOL'"
                  :label="field.label"
                  v-model="formData[category.id]['fields'][field.id]['value']"
                  @update:model-value="updateValue($event, field)"
                ></v-checkbox>
                <v-select
                  v-else-if="field.type === 'GENDER'"
                  :label="field.label"
                  :items="genderOptions"
                  item-title="text"
                  item-value="value"
                  chips
                  v-model="formData[category.id]['fields'][field.id]['value']"
                  @update:model-value="updateValue($event, field)"
                ></v-select>
                <v-text-field
                  v-else
                  :label="field.label"
                  :type="getTextFieldType(field.type)"
                  v-model="formData[category.id]['fields'][field.id]['value']"
                  @update:model-value="updateValue($event, field)"
                ></v-text-field>
                <!--
                <InputField
                  :type="field.type"
                  :label="field.label"
                  :model="formData[category.id].fields[field.id]['value']"
                  :nameIntern="formData[category.id].fields[field.id].name_intern"
                />
                -->
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
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import PageTitle from '@/components/PageTitle.vue'

const $route = useRoute()
const $router = useRouter()

const loading = ref(false)

const member = ref([])
const categories = ref([])
const fields = ref([])

const formData = ref({})

let updatedValues = {}

const genderOptions = [
  {
    text: 'Männlich',
    value: 'M'
  },
  {
    text: 'Weiblich',
    value: 'W'
  },
  {
    text: 'Divers',
    value: 'D'
  },
  {
    text: 'Keine Angabe',
    value: '-'
  }
]

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
            label: el.name,
            members_data_id: null,
            field_name_intern: el.name_intern
          }
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
        member.value = data
        data.forEach((el) => {
          const cat = fields.value.find(field => field.id === el.member_field_id)
          let value = el.value
          // TODO: convert to matching type
          if(cat.type === 'BOOL') {
            value = JSON.parse(el.value)
          }
          formData.value[cat?.cat_id].fields[el.member_field_id].value = value
          formData.value[cat?.cat_id].fields[el.member_field_id].members_data_id = el.id
        })
      }
    })
    .catch((error) => {
      toast.error(error.message)
    })
  loading.value = false
}

fetchData()

const fieldsByCategory = (cat_id) => {
  return fields.value.filter(el => el.cat_id === cat_id)
}

const formDataFieldsByCategory = (cat_id) => {
  return Object.keys(formData.value[cat_id]?.fields)
    .map(id => ({ id, ...formData.value[cat_id]?.fields[id] }))
}

const getMemberDataByFieldID = (field_id) => {
  return loading.value ? '...' : member?.value?.find(el => el?.member_field_id === field_id)?.value
}

const getMemberDataByFieldNameIntern = (name_intern) => {
  const field_id = fields?.value?.find(el => el.name_intern === name_intern)?.id
  const data = member?.value?.find(el => el?.member_field_id === field_id)?.value
  return data ? data : '...'
}

const getTextFieldType = (type) => {
  switch(type) {
    case 'EMAIL':
      return 'email'
    case 'PHONE':
      return 'tel'
    case 'DATE':
      return 'date'
    case 'URL':
      return 'url'
    default:
      return 'text'
  }
}

const updateValue = (value, field) => {
  updatedValues[field.id] = {
    member_id: parseInt($route.params.id),
    member_field_id: parseInt(field.id),
    value: value,
  }
  if(field.members_data_id) {
    updatedValues[field.id].id = field.members_data_id
  }
}

const saveMember = async () => {
  loading.value = true
  await supabase.from('members_data')
    .upsert(
      Object.values(updatedValues)
    )
    .select()
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        updatedValues = {}
        const len = data.length
        let message = data.length + " Änderung"
        if(len > 1) { message += "en" }
        message += " gespeichert"
        toast.success(message)
        $router.push({ name: 'Mitglied ansehen', params: { id: $route.params.id }})
        loading.value = false
      }
    })
    .catch((error) => {
      console.log(error)
      toast.error(error.message)
    })
}

</script>
