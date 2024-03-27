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
                  Kontodaten bearbeiten
                </v-card-title>
              </v-row>
              <v-row>
                <v-col cols="12" sm="6" class="pb-0">
                  <v-text-field
                    v-model="iban"
                    label="IBAN"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" class="pb-0">
                  <v-text-field
                    v-model="bic"
                    label="BIC"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" class="pb-0">
                  <v-text-field
                    v-model="mandateReference"
                    label="Mandatsreferenz"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" class="pb-0">
                  <v-text-field
                    v-model="mandateDate"
                    label="Mandatsdatum"
                    type="date"
                    clearable
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
const iban = ref('')
const bic = ref('')
const mandateReference = ref('')
const mandateDate = ref('')

const showDialog = ref(false)

watch(showDialog, (newVal) => {
  if (newVal) {
    const member = membersStore.getByID(props.id)
    iban.value = member['IBAN']
    bic.value = member['BIC']
    mandateReference.value = member['MANDATE_REF']
    mandateDate.value = member['MANDATE_DATE']
  }
})

const onSave = async () => {
  loading.value = true
  const member = {
    IBAN: iban.value || '',
    BIC: bic.value || '',
    MANDATE_REF: mandateReference.value || '',
    MANDATE_DATE: mandateDate.value || '',
  }
  await membersStore.updateMember(props.id, member)
  await membersStore.fetchMember(props.id)
  await props.callbackFn()
  toast.success('Änderungen wurden gespeichert.')
  loading.value = false
  showDialog.value = false
}

</script>
