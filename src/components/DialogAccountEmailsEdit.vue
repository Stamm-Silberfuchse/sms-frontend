<template>
  <v-dialog
    v-model="props.showDialog"
    width="600"
    persistent
  >
    <v-card>
      <v-form
        ref="form"
        v-model="valid"
        :loading="loading"
        lazy-validation
        @submit.prevent="onSave"
      >
        <v-card-text class="py-2 mb-3">
          <v-container>
            <v-row>
              <v-card-title>
                E-Mail-Adressen bearbeiten
              </v-card-title>
            </v-row>
            <template v-for="(_, idx) in addresses">
              <v-row class="px-2 mt-4">
                <v-col class="pl-2 pt-3">
                  <v-text-field
                    v-model="addresses[idx]"
                    label="E-Mail-Adresse"
                    type="email"
                    hide-details
                  />
                </v-col>
                <v-col cols="auto" align-self="center" class="py-2 pl-2">
                  <v-tooltip location="end">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        icon
                        size="x-small"
                        variant="flat"
                        v-bind="props"
                        @click="newsletters[idx] = !newsletters[idx]"
                      >
                        <v-icon
                          :color="newsletters[idx] ? 'success' : 'error'"
                          size="x-large"
                        >
                          {{ newsletters[idx] ? 'mdi-email-check-outline' : 'mdi-email-remove-outline' }}
                        </v-icon>
                      </v-btn>
                    </template>
                    {{ newsletterTooltip(idx) }}
                  </v-tooltip>
                </v-col>
                <v-col cols="auto" align-self="center" class="py-2 pl-2">
                  <v-btn
                    icon
                    size="x-small"
                    variant="flat"
                    @click="onDeleteRow(idx)"
                  >
                    <v-icon size="x-large">
                      mdi-window-close
                    </v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </template>
            <v-row justify="center" class="mt-6 mb-0">
              <v-btn
                prepend-icon="mdi-plus"
                border
                variant="text"
                v-bind="props"
                class="text-none mt-3"
                @click="onAddRow"
              >
                Hinzufügen
              </v-btn>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            class="text-none"
            @click="onAbort"
          >
            Abbrechen
          </v-btn>
          <v-btn
            :disabled="loading || !valid"
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
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getAuth } from 'firebase/auth'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useUsersStore } from '@/store/users'

const emit = defineEmits(['close'])

const usersStore = useUsersStore()

const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false
  },
  emailAddresses: {
    type: Array,
    default: []
  }
})

const form = ref(null)
const valid = ref(false)

const addresses = ref([])
const newsletters = ref([])

const loading = ref(false)

const onSave = async () => {
  loading.value = true
  const { valid } = await form.value?.validate()
  if (!valid) {
    toast.info('Bitte überprüfe deine Angaben.')
    loading.value = false
    return
  }

  try {
    console.log('addresses', addresses.value.map((address, idx) => ({
      address: address,
      newsletter: newsletters.value[idx]
    })))
    const doc = await usersStore.updateUser(
      getAuth().currentUser.uid,
      {
        emailAddresses: [
          ...addresses.value.map((address, idx) => ({
            address: address,
            newsletter: newsletters.value[idx]
          }))
        ]
      }
    )
    emit('close')
    form.value?.reset()
    toast.success('E-Mail-Angaben wurden gespeichert.')
  } catch (error) {
    console.error(error)
    toast.error('E-Mail-Angaben konnten nicht gespeichert werden.')
  } finally {
    loading.value = false
  }
}

const onAbort = () => {
  emit('close')
  form.value?.reset()
}

const onAddRow = () => {
  addresses.value.push('')
  newsletters.value.push(false)
}

const onDeleteRow = (index) => {
  addresses.value.splice(index, 1)
  newsletters.value.splice(index, 1)
}

const newsletterTooltip = (index) => {
  if (newsletters.value[index]) {
    return 'Diese E-Mail-Adresse erhält Einladungen und Anmeldungen.'
  } else {
    return 'Diese E-Mail-Adresse erhält KEINE Einladungen und Anmeldungen.'
  }
}

watch(() => props.showDialog, () => {
  if (props.showDialog) {
    addresses.value = props.emailAddresses.map((item) => item?.address)
    newsletters.value = props.emailAddresses.map((item) => item?.newsletter)
  }
})
</script>
