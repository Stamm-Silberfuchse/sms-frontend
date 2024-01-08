<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
        <PageTitle title="Dein Account" />
        <v-row class="mx-3">
          <v-card
            elevation="8"
            max-width="486"
            width="100%"
            class="mx-auto mt-2 pa-6"
          >
            <v-row justify="center" class="mt-6 mb-0">
              <AccountAvatarForm
                size="100"
                :teamName="user?.displayName"
                :photoURL="user?.photoURL"
              />
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
                    :label="isAdmin ? 'Anzeigename' : 'Euer Teamname'"
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

            <v-file-input
              ref="uploader"
              v-model="imageFile"
              accept="image/png, image/jpeg, image/bmp"
              class="d-none"
              type="file"
              @update:modelValue="onFileChanged"
            />
          </v-card>
        </v-row>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

import { useAuthStore } from '@/store/auth'

import AccountAvatarForm from '@/components/AccountAvatarForm.vue'
import PageTitle from '@/components/PageTitle.vue'

const authStore = useAuthStore()

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
