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
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" md="4" class="pb-0">
                  <v-text-field
                    v-model="lastName"
                    label="Nachname"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" md="4" class="pb-0">
                  <v-text-field
                    v-model="nickname"
                    label="Fahrtenname"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="8" md="8" class="pb-0">
                  <v-text-field
                    v-model="address"
                    label="Adresse"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" md="4" class="pb-0">
                  <v-text-field
                    v-model="zip"
                    label="PLZ"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6" class="pb-0">
                  <v-text-field
                    v-model="city"
                    label="Ort"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6" class="pb-0">
                  <v-text-field
                    v-model="country"
                    label="Land"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="4" class="pb-0">
                  <v-text-field
                    v-model="nationality"
                    label="Nationalität"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4" class="pb-0">
                  <v-text-field
                    v-model="birthday"
                    label="Geburtstag"
                    type="date"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4" class="pb-0">
                  <v-text-field
                    v-model="birthplace"
                    label="Geburtsort"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4" class="pb-0">
                  <v-text-field
                    v-model="phone"
                    label="Telefon (Festnetz)"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4" class="pb-0">
                  <v-text-field
                    v-model="mobile"
                    label="Mobil"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="4" class="pb-0">
                  <v-text-field
                    v-model="email"
                    label="E-Mail"
                    type="email"
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

watch(showDialog, (newVal) => {
  if (newVal) {
    const member = membersStore.getByID(props.id)
    firstName.value = member['FIRST_NAME'] || ''
    lastName.value = member['LAST_NAME'] || ''
    nickname.value = member['NICKNAME'] || ''
    address.value = member['ADDRESS'] || ''
    zip.value = member['ZIP_CODE'] || ''
    city.value = member['CITY'] || ''
    country.value = member['COUNTRY'] || ''
    nationality.value = member['NATIONALITY'] || ''
    birthday.value = member['BIRTHDAY'] || ''
    birthplace.value = member['BIRTHPLACE'] || ''
    phone.value = member['PHONE'] || ''
    mobile.value = member['MOBILE'] || ''
    email.value = member['EMAIL'] || ''
  }
})

const onSave = async () => {
  loading.value = true
  const member = {
    FIRST_NAME: firstName.value,
    LAST_NAME: lastName.value,
    NICKNAME: nickname.value,
    NAME: `${firstName.value} ${lastName.value}`,
    ADDRESS: address.value,
    ZIP_CODE: zip.value,
    CITY: city.value,
    COUNTRY: country.value,
    NATIONALITY: nationality.value,
    BIRTHDAY: birthday.value,
    BIRTHPLACE: birthplace.value,
    PHONE: phone.value,
    MOBILE: mobile.value,
    EMAIL: email.value
  }
  await membersStore.updateMember(props.id, member)
  await membersStore.fetchMember(props.id)
  await props.callbackFn()
  toast.success('Änderungen wurden gespeichert.')
  loading.value = false
  showDialog.value = false
}

</script>
