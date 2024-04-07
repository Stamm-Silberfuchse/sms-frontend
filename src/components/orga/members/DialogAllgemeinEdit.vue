<template>
  <v-dialog
    width="1024"
    v-model="showDialog"
    persistent
  >
    <template v-slot:activator="{ props }">
      <v-btn
        icon
        size="x-small"
        variant="flat"
        v-bind="props"
      >
        <v-icon size="x-large">
          mdi-pencil
        </v-icon>
      </v-btn>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-form
          ref="form"
          fast-fail
          @submit.prevent="onSave"
        >
          <v-card-text class="py-2">
            <v-container>
              <v-row>
                <v-card-title>
                  Allgemeine Infos bearbeiten
                </v-card-title>
              </v-row>
              <v-row>
                <v-col cols="12" sm="4" md="4" class="pb-0">
                  <v-text-field
                    v-model="firstName"
                    label="Vorname"
                    required
                    @update:model-value="editedValues['FIRST_NAME'] = firstName"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" md="4" class="pb-0">
                  <v-text-field
                    v-model="lastName"
                    label="Nachname"
                    required
                    @update:model-value="editedValues['LAST_NAME'] = lastName"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" md="4" class="pb-0">
                  <v-text-field
                    v-model="nickname"
                    label="Fahrtenname"
                    @update:model-value="editedValues['NICKNAME'] = nickname"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="8" md="8" class="pb-0">
                  <v-text-field
                    v-model="address"
                    label="Adresse"
                    @update:model-value="editedValues['ADDRESS'] = address"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" md="4" class="pb-0">
                  <v-text-field
                    v-model="zip"
                    label="PLZ"
                    @update:model-value="editedValues['ZIP'] = zip"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6" class="pb-0">
                  <v-text-field
                    v-model="city"
                    label="Ort"
                    @update:model-value="editedValues['CITY'] = city"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6" class="pb-0">
                  <v-text-field
                    v-model="country"
                    label="Land"
                    @update:model-value="editedValues['COUNTRY'] = country"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="4" class="pb-0">
                  <v-text-field
                    v-model="nationality"
                    label="Nationalität"
                    @update:model-value="editedValues['NATIONALITY'] = nationality"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4" class="pb-0">
                  <v-text-field
                    v-model="birthday"
                    label="Geburtstag"
                    type="date"
                    @update:model-value="editedValues['BIRTHDAY'] = birthday"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4" class="pb-0">
                  <v-text-field
                    v-model="birthplace"
                    label="Geburtsort"
                    @update:model-value="editedValues['BIRTHPLACE'] = birthplace"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4" class="pb-0">
                  <v-text-field
                    v-model="phone"
                    label="Telefon (Festnetz)"
                    @update:model-value="editedValues['PHONE'] = phone"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4" class="pb-0">
                  <v-text-field
                    v-model="mobile"
                    label="Mobil"
                    @update:model-value="editedValues['MOBILE'] = mobile"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="4" class="pb-0">
                  <v-text-field
                    v-model="email"
                    label="E-Mail"
                    type="email"
                    @update:model-value="editedValues['EMAIL'] = email"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              class="text-none"
              @click="isActive.value = false"
            >
              Abbrechen
            </v-btn>
            <v-btn
              :disabled="loading || (name?.length === 0)"
              :loading="loading"
              color="primary"
              variant="elevated"
              class="text-none"
              type="submit"
            >
              Speichern
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useMembersStore } from '@/store/members'

const membersStore = useMembersStore()

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  callbackFn: {
    type: Function,
    default: async () => {}
  }
})

const loading = ref(false)
const firstName = ref('')
const lastName = ref('')
const nickname = ref('')
const address = ref('')
const zip = ref('')
const city = ref('')
const country = ref('')
const nationality = ref('')
const birthday = ref('')
const birthplace = ref('')
const phone = ref('')
const mobile = ref('')
const email = ref('')

const showDialog = ref(false)

const editedValues = ref({})

watch(showDialog, (newVal) => {
  if (newVal) {
    const member = membersStore.getByID(props.id)
    firstName.value = member['FIRST_NAME'] || ''
    lastName.value = member['LAST_NAME'] || ''
    nickname.value = member['NICKNAME'] || ''
    address.value = member['ADDRESS'] || ''
    zip.value = member['ZIP'] || ''
    city.value = member['CITY'] || ''
    country.value = member['COUNTRY'] || ''
    nationality.value = member['NATIONALITY'] || ''
    birthday.value = member['BIRTHDAY'] || ''
    birthplace.value = member['BIRTHPLACE'] || ''
    phone.value = member['PHONE'] || ''
    mobile.value = member['MOBILE'] || ''
    email.value = member['EMAIL'] || ''
    editedValues.value = {}
  }
})

const onSave = async () => {
  loading.value = true
  await membersStore.updateMember(props.id, editedValues.value)
  await membersStore.fetchMember(props.id)
  await props.callbackFn()
  const numberOfChanges = Object.keys(editedValues.value)?.length
  const pl = numberOfChanges > 1
  toast.success(`${numberOfChanges} Änderung${pl ? 'en' : ''} wurde${pl ? 'n' : ''} gespeichert.`)
  loading.value = false
  showDialog.value = false
}

</script>
