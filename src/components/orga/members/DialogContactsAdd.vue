<template>
  <v-dialog
    v-model="props.showDialog"
    width="480"
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
        <v-card-text class="py-2">
          <v-container>
            <v-row>
              <v-card-title>
                Kontakt anlegen
              </v-card-title>
            </v-row>
            <v-row>
              <v-col cols="12" class="pb-0">
                <v-text-field
                  v-model="name"
                  label="Name"
                  required
                  autofocus
                  :rules="nameRules"
                ></v-text-field>
                <v-combobox
                  v-model="relationship"
                  :label="`Beziehung zu ${membersStore.getByID(memberID)?.NAME}`"
                  required
                  :items="['Mutter', 'Vater', 'Oma', 'Opa', 'Tante', 'Onkel', 'Freundin', 'Freund', 'Schwester', 'Bruder']"
                  :rules="relationshipRules"
                ></v-combobox>
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
            Anlegen
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useMembersStore } from '@/store/members'
import { useContactsStore } from '@/store/contacts'

const emit = defineEmits(['callbackFn', 'onClose'])

const membersStore = useMembersStore()
const contactsStore = useContactsStore()

const props = defineProps({
  memberID: {
    type: String,
    required: true
  },
  showDialog: {
    type: Boolean,
    default: false
  },
  callbackFn: {
    type: Function,
    default: async () => {}
  },
})

const form = ref(null)
const valid = ref(false)

const name = ref('')
const relationship = ref('')

const loading = ref(false)

const nameRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte gib einen Namen an.'
  },
])
const relationshipRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte mach eine Angabe.'
  },
])

const onSave = async () => {
  loading.value = true
  const { valid } = await form.value?.validate()
  if (!valid) {
    toast.info('Bitte überprüfe deine Angaben.')
    loading.value = false
    return
  }

  try {
    const doc = await contactsStore.addContact({
      name: name.value,
      relationship: relationship.value,
      // memberID: props.memberID,
      fields: [],
      // order: contactsStore.getAllByMemberID(props.memberID).length
    })
    const docMember = await membersStore.updateMember(props.memberID, {
      CONTACTS: [...membersStore.getByID(props.memberID).CONTACTS || [], doc.id]
    })
    emit('callbackFn')
    emit('onClose')
    form.value?.reset()
    toast.success('Kontakt wurde angelegt.')
  } catch (error) {
    console.error(error)
    toast.error('Kontakt konnte nicht angelegt werden.')
  } finally {
    loading.value = false
  }
}

const onAbort = () => {
  emit('onClose')
  form.value?.reset()
}
</script>
