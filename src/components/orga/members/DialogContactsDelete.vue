<template>
  <v-dialog
    v-model="props.showDialog"
    width="480"
    persistent
  >
    <v-card>
      <v-card-text class="py-2">
        <v-container>
          <v-row class="mb-2">
            <v-card-title>
              Kontaktperson löschen
            </v-card-title>
          </v-row>

          <v-row
            v-for="(contact, k) in contacts"
            :key="`contact-${contact.id}`"
            class="mx-0"
          >
            <v-col cols="12" class="py-1 px-0">
              <v-card
                variant="flat"
                border
                class="pb-0"
              >
                <v-card-text class="px-3 py-2">
                  <v-row class="ma-0 pa-0">
                    <v-col cols="auto" align-self="baseline" class="pa-0 pr-1">
                      <span class="text-subtitle-1 font-weight-medium">
                        {{ contact.name }}
                      </span>
                    </v-col>
                    <v-col cols="auto" align-self="baseline" class="pa-0 pr-1">
                      <span class="text-subtitle-1 font-weight-regular text-disabled"> ({{ contact.relationship }})</span>
                    </v-col>
                    <v-spacer />
                    <v-col cols="auto" class="pa-0">
                      <v-btn
                        icon
                        size="x-small"
                        variant="flat"
                        @click="onDeleteContact(contact)"
                      >
                        <v-icon size="x-large">
                          mdi-delete
                        </v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                  <div class="mt-1"></div>
                  <v-row
                    v-for="(field, idx) in contact.fields"
                    :key="`contactfield-${idx}`"
                    class="mt-0 mb-1 ml-0"
                  >
                    <v-col cols="3" align-self="center" class="py-0 px-0">
                      <v-card-text class="text-body-1 font-weight-bold py-0 pl-0">
                        {{ field.name }}:
                      </v-card-text>
                    </v-col>
                    <v-col class="py-1 pl-0" align-self="center">
                      <span class="text-body-1 py-0" v-html="parseField(field?.type, field?.value)">
                      </span>
                    </v-col>
                    <v-col cols="auto" class="py-1" align-self="center">
                      <v-icon color="success" size="small" class="pr-4">mdi-email-check-outline</v-icon>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
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
          Schließen
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { useConfirm } from 'vuetify-use-dialog'

import { useMembersStore } from '@/store/members'

const emit = defineEmits(['onClose', 'onChange'])

const createConfirm = useConfirm()

const membersStore = useMembersStore()

const props = defineProps({
  memberID: {
    type: String,
    required: true
  },
  contacts: {
    type: Array,
    required: true
  },
  showDialog: {
    type: Boolean,
    default: false
  }
})

const loading = ref(false)

const contacts = ref([])

const onDeleteContact = async (contact) => {
  const isConfirmed = await createConfirm({
    title: `Kontaktperson '${contact?.name}' löschen`,
    content: 'Bist Du sicher?',
  })
  if (!isConfirmed) return

  loading.value = true

  let contactsNew = contacts.value.map((cntct) => cntct.id)
  contactsNew = contactsNew.filter((id) => id !== contact.id)

  contacts.value = contacts.value.filter((cntct) => cntct.id !== contact.id)

  try {
    await membersStore.updateMember(props.memberID, {
      CONTACTS: contactsNew
    })
    emit('onChange')
    toast.success('Kontaktperson wurde gelöscht.')
  } catch (error) {
    console.error(error)
    toast.error('Fehler beim Löschen der Kontaktperson.')
  } finally {
    loading.value = false
  }
}

const onAbort = () => {
  emit('onClose')
}

watch(() => props.showDialog, () => {
  contacts.value = props.contacts
})

</script>

<style scoped>

</style>
