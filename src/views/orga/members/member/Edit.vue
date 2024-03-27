<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
        <PageTitle
          :back="{ name: 'Mitglied ansehen', params: { id: route.params.id } }"
          :title="`${member['FIRST_NAME']} ${member['LAST_NAME']}`"
          :loading="loading"
        >
          <MNrLabel
            v-if="member?.MNR != null"
            :mNr="member.MNR"
            size="default"
            class="mx-2"
          ></MNrLabel>
          <Avatar
            v-if="showAvatar"
            :userID="member.uid"
            :size="32"
            :tooltip="true"
            tooltipPrepend="User: "
            tooltipLocation="bottom"
            class="mx-2"
          />
          <v-chip
            class="mt-2 ml-2"
            variant="flat"
            text-color="white"
          >
            inaktiv
          </v-chip>
          <v-chip
            class="mt-2 ml-2"
            variant="flat"
            color="orange"
          >
            Meute
          </v-chip>
          <v-chip
            class="mt-2 ml-2"
            variant="flat"
            color="blue-darken-4"
          >
            Sippe
          </v-chip>
          <v-chip
            class="mt-2 ml-2"
            variant="flat"
            color="red-darken-4"
          >
            Rover
          </v-chip>
          <v-chip
            class="mt-2 ml-2"
            variant="flat"
            color="yellow-darken-4"
            prependIcon="mdi-crown"
          >
            StaFü
          </v-chip>
        </PageTitle>

        <v-row justify="start" class="mx-0 pt-0 px-3 pb-3">
          <v-btn
            :loading="loadingSave"
            color="primary"
            prependIcon="mdi-content-save"
            class="mr-4 mb-4 text-none"
            @click="saveMember"
          >
            Speichern
          </v-btn>
        </v-row>

        <v-row
          v-if="!loading"
          justify="start"
          class="mx-0 mt-0 mb-4"
          style="padding-left: -20px;"
        >
          <v-col cols="12" lg="4" md="6" justify="start" v-for="(category, i) in categoriesStore.getAllSorted">
            <v-card width="100%" class="pa-3">
              <v-card-text class="mb-6 pa-0">
                <v-card-title class="text-h5 text--primary mb-5">
                  {{ category.name }}
                </v-card-title>
                <v-row
                  v-for="(field, k) in fieldsStore.getAllByCategoryID(category.id)"
                  :key="`${i}-${field.id}`"
                >
                  <v-col cols="12" class="py-1 px-7">
                    <v-checkbox
                      v-if="field.type === 'Boolean'"
                      :label="field.name"
                      v-model="formData[field.id]['value']"
                      @update:model-value="updateValue($event, field)"
                    ></v-checkbox>
                    <v-select
                      v-else-if="field.type === 'GENDER'"
                      :label="field.name"
                      :items="genderOptions"
                      item-title="text"
                      item-value="value"
                      chips
                      v-model="formData[field.id]['value']"
                      @update:model-value="updateValue($event, field)"
                    ></v-select>
                    <v-text-field
                      v-else
                      :label="field.name"
                      :type="getTextFieldType(field.type)"
                      v-model="formData[field.id]['value']"
                      @update:model-value="updateValue($event, field)"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <div v-if="!loading" class="bottom-info mt-6">
        <div class="text-center font-weight-light" style="font-size: 14px;">
          <p>erstellt von <b>{{ usersStore.getByID(member?.createdUserID)?.displayName }}</b> am {{ fdate(member?.createdTimestamp) }}</p>
          <p v-if="member?.updatedTimestamp != null">
            zuletzt bearbeitet von <b>{{ usersStore.getByID(member?.updatedUserID)?.displayName }}</b> am {{ fdate(member?.updatedTimestamp) }}
          </p>
        </div>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import format from 'date-fns/format'
import de from 'date-fns/locale/de'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useUsersStore } from '@/store/users'
import { useMembersStore } from '@/store/members'
import { useCategoriesStore } from '@/store/categories'
import { useFieldsStore } from '@/store/fields'

import PageTitle from '@/components/PageTitle.vue'
import Avatar from '@/components/Avatar.vue'
import MNrLabel from '@/components/orga/members/MNrLabel.vue'

const route = useRoute()
const router = useRouter()

const usersStore = useUsersStore()
const membersStore = useMembersStore()
const categoriesStore = useCategoriesStore()
const fieldsStore = useFieldsStore()

const loading = ref(true)
const loadingSave = ref(false)

const member = ref([])

const formData = ref({})

const updatedValues = ref({})

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

const initForm = async () => {
  loading.value = true
  const id = route.params.id
  console.log(membersStore.getByID(id))
  if (membersStore.getByID(id) === undefined) {
    await membersStore.fetchMember(id)
  }
  member.value = membersStore.getByID(id)
  fieldsStore.getAll.forEach((field) => {
    formData.value[field.id] = {
      value: member.value[field.id] || '',
      type: field.type
    }
  })
  updatedValues.value = {}
  loading.value = false
}

onMounted(async () => {
  await initForm()
})

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
  updatedValues.value[field.id] = value
}

const saveMember = async () => {
  loadingSave.value = true
  await membersStore.updateMember(route.params.id, updatedValues.value)
  toast.success( Object.keys(updatedValues.value).length + " Änderung(en) gespeichert.")
  initForm()
  loadingSave.value = false
  router.push({ name: 'Mitglied ansehen', params: { id: route.params.id } })
}

const showAvatar = computed(() => {
  return member.value?.uid != null && member.value?.uid.length > 0
})

const fdate = (date) => {
  if(date === null || date === undefined) return ''
  return format(date.toDate(), 'dd.MM.yyyy, HH:mm', {locale: de})
}
</script>
