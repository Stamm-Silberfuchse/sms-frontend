<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
        <PageTitle title="Dein Silberfuchs-Account" />
        <v-row justify="start" class="mx-0">
          <v-col cols="12" md="4">
            <v-card
              elevation="8"
              max-width="486"
              width="100%"
              class="mx-auto mt-2 pa-6"
            >
              <v-row justify="center" class="mt-6 mb-0">
                <AccountAvatarForm size="100" />
              </v-row>

              <v-form
                @submit.prevent
                ref="form"
                v-model="valid"
                fast-fail
              >
                <v-row class="mb-0 mt-12 pb-0 pt-0" style="height: 100px;">
                  <v-col v-if="!editing" class="text-center my-0 py-0">
                    <div class="text-h5 font-weight-bold">
                      {{ authStore?.displayName }}
                    </div>
                    <div class="mt-2 text-body-1 font-weight-light">
                      {{ authStore?.email }}
                    </div>
                  </v-col>
                  <v-col v-else class="my-0 py-0">
                    <v-text-field
                      v-model="editDisplayName"
                      label="Anzeigename"
                      prepend-inner-icon="mdi-account"
                      variant="outlined"
                      density="compact"
                      color="primary"
                      :rules="displayNameRules"
                      class="pt-3"
                      required
                      autofocus
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row v-if="!editing" class="mt-0">
                  <v-col>
                    <v-btn
                      block
                      class="text-none"
                      color="primary"
                      variant="flat"
                      @click="editing = true"
                    >
                      Name ändern
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row v-else class="mt-0">
                  <v-col>
                    <v-btn
                      block
                      class="text-none"
                      variant="tonal"
                      @click="abortEditing"
                    >
                      Abbrechen
                    </v-btn>
                  </v-col>
                  <v-col>
                    <v-btn
                      block
                      class="text-none"
                      color="primary"
                      variant="flat"
                      type="submit"
                      :loading="loading"
                      :disabled="!valid"
                      @click="saveDisplayName"
                    >
                      Speichern
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>

              <v-btn
                block
                color="primary"
                variant="flat"
                class="mt-4 text-none"
              >
                Passwort ändern
              </v-btn>
            </v-card>

          </v-col>

          <v-col cols="12" md="4">
            <v-card
              variant="outlined"
              max-width="486"
              width="100%"
              class="mx-auto mt-2 pa-6 pb-9"
            >
              <v-row class="mt-0 mx-0 mb-3">
                <v-icon color="primary" class="me-2 mt-1">
                  mdi-email
                </v-icon>
                <p class="text-h6 font-weight-bold">
                  E-Mail-Adressen
                </p>
                <v-tooltip location="end">
                  Diese E-Mail-Adressen dienen als Kontakt-Möglichkeit.<br />
                  Sofern du zustimmst, erhältst du Einladungen, Anmeldungen und weitere Informationen per E-Mail.
                  <template v-slot:activator="{ props: tooltipProps }">
                    <v-icon
                      ref="activatorRef"
                      v-bind="tooltipProps"
                      size="x-small"
                      class="mt-2 ms-2"
                    >
                      mdi-information-outline
                    </v-icon>
                  </template>
                </v-tooltip>
                <v-spacer />
                <v-btn
                  icon
                  variant="plain"
                  size="x-small"
                  @click="showEmailsDialog = true"
                >
                  <v-icon size="x-large">
                    mdi-pencil
                  </v-icon>
                </v-btn>
                <DialogAccountEmailsEdit
                  :showDialog="showEmailsDialog"
                  :email-addresses="emailAdresses"
                  @close="showEmailsDialog = false"
                />
              </v-row>

              <template v-for="(email, idx) in emailAdresses">
                <v-row class="mt-4 mx-2">
                  <v-col class="py-1 pl-0" align-self="center">
                    {{  email?.address }}
                  </v-col>
                  <v-col cols="auto" class="py-1" align-self="center">
                    <v-icon :color="email?.newsletter ? 'success' : 'error'" size="small">
                      {{ email?.newsletter ? 'mdi-email-check-outline' : 'mdi-email-remove-outline' }}
                    </v-icon>
                  </v-col>
                </v-row>
              </template>
            </v-card>

            <v-card
              variant="outlined"
              max-width="486"
              width="100%"
              class="mx-auto mt-6 pa-6 pb-9"
            >
              <v-row class="mt-0 mx-0 mb-3">
                <v-icon color="primary" class="me-2 mt-1">
                  mdi-phone
                </v-icon>
                <p class="text-h6 font-weight-bold">
                  Telefonnummern
                </p>
                <v-tooltip location="end">
                  Diese Telefonnummern dienen als Notfallkontakte.<br />
                  Sollte mal etwas passieren, werden wir versuchen, diese Nummer(n) zu erreichen.
                  <template v-slot:activator="{ props: tooltipProps }">
                    <v-icon
                      ref="activatorRef"
                      v-bind="tooltipProps"
                      size="x-small"
                      class="mt-2 ms-2"
                    >
                      mdi-information-outline
                    </v-icon>
                  </template>
                </v-tooltip>
                <v-spacer />
                <v-btn
                  icon
                  variant="plain"
                  size="x-small"
                  @click="showPhonesDialog = true"
                >
                  <v-icon size="x-large">
                    mdi-pencil
                  </v-icon>
                </v-btn>
                <DialogAccountPhonesEdit
                  :showDialog="showPhonesDialog"
                  :phone-numbers="phoneNumbers"
                  @close="showPhonesDialog = false"
                />
              </v-row>

              <template v-for="(phone, idx) in phoneNumbers">
                <v-row class="mt-4 mx-2">
                  <v-col class="py-1 pl-0" align-self="center">
                    {{ phone?.number }}
                    <span class="text-medium-emphasis" >
                      - {{ phone?.name }}
                    </span>
                  </v-col>
                </v-row>
              </template>

            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card
              variant="outlined"
              max-width="486"
              width="100%"
              class="mx-auto mt-2 pa-6 pb-9"
            >
              <v-row class="mt-0 mx-0 mb-3">
                <v-icon color="primary" class="me-2 mt-1">
                  mdi-account
                </v-icon>
                <p class="text-h6 font-weight-bold">
                  Mitgliedschaft
                </p>
                <v-tooltip location="end">
                  {{
                    members?.length > 1
                    ? "Dieser Account ist mit den aufgelisteten Mitgliedern verknüpft."
                    : "Dieser Account ist mit dem aufgelisteten Mitglied verknüpft."
                  }}
                  <template v-slot:activator="{ props: tooltipProps }">
                    <v-icon
                      ref="activatorRef"
                      v-bind="tooltipProps"
                      size="x-small"
                      class="mt-2 ms-2"
                    >
                      mdi-information-outline
                    </v-icon>
                  </template>
                </v-tooltip>
              </v-row>
              <template v-for="(member, idx) in members">
                <v-row class="mt-4 mx-2">
                  <v-card variant="outlined" class="w-100 mb-2">
                    <v-row justify="start" class="flex-nowrap">
                      <v-col cols="auto" class="pa-0">
                        <v-avatar
                          class="ma-3"
                          rounded="0"
                          size="70"
                        >
                          <v-img :src="member?.PHOTO_URL"></v-img>
                        </v-avatar>
                      </v-col>
                      <v-col align-self="center" class="pa-0">
                        <v-card-title class="text-body1">
                          {{ member?.FIRST_NAME }} {{ member?.LAST_NAME }}
                        </v-card-title>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-row>
              </template>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

import { useAuthStore } from '@/store/auth'
import { useUsersStore } from '@/store/users'
import { useMembersStore } from '@/store/members'

import AccountAvatarForm from '@/components/AccountAvatarForm.vue'
import PageTitle from '@/components/PageTitle.vue'
import MNrLabel from '@/components/orga/members/MNrLabel.vue'
import DialogAccountEmailsEdit from '@/components/DialogAccountEmailsEdit.vue'
import DialogAccountPhonesEdit from '@/components/DialogAccountPhonesEdit.vue'

const authStore = useAuthStore()
const usersStore = useUsersStore()
const membersStore = useMembersStore()

const editDisplayName = ref(authStore?.displayName)
const editing = ref(false)

const valid = ref(false)
const loading = ref(false)

const uploader = ref()
const imageFile = ref(null)

const displayNameRules = ref([
  value => {
    if (value) return true
    return 'Bitte gib einen Namen an.'
  },
  value => {
    if (value?.length > 1) return true
    return 'Dein Name muss mindestens 2 Buchstaben haben.'
  },
])

onMounted(() => {
  const membersOfUser = usersStore.getMe.members
  membersOfUser.forEach(memberID => {
    membersStore.fetchMember(memberID)
  })
})

const showEmailsDialog = ref(false)
const showPhonesDialog = ref(false)

const emailAdresses = computed(() => {
  return usersStore?.getByID(getAuth().currentUser.uid)?.emailAddresses
})

const phoneNumbers = computed(() => {
  return usersStore?.getByID(getAuth().currentUser.uid)?.phoneNumbers
})

const members = computed(() => {
  let myMembers = []
  const memberIDs = usersStore?.getByID(getAuth().currentUser.uid)?.members
  memberIDs.forEach(id => {
    myMembers.push(membersStore.getByID(id))
  })
  return myMembers
})

const saveDisplayName = async () => {
    loading.value = true
    authStore.displayName = editDisplayName.value
    await authStore.updateProfile({ displayName: editDisplayName.value })
      .then(() => {
        loading.value = false
        editing.value = false
      })
    const db = getFirestore()
    const docRef = doc(db, 'users', getAuth().currentUser.uid)
    await setDoc(docRef, {
      displayName: editDisplayName.value,
    }, { merge: true })
  }

const abortEditing = () => {
  editing.value = false
  editDisplayName.value = authStore?.displayName
}

watch(authStore, async () => {
  editDisplayName.value = authStore?.displayName
})
</script>
