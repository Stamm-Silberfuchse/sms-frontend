<template>
  <v-dialog
    v-model="props.showDialog"
    width="480"
    persistent
  >
    <v-card>
      <v-card-text class="py-2">
        <v-container>
          <v-row>
            <v-card-title>
              Reihenfolge ändern
            </v-card-title>
          </v-row>
          <v-row>
            <v-col cols="12" class="pb-0">
              <draggable
                tag="div"
                v-model="contacts"
                item-key="name"
                v-bind="dragOptions"
                @start="drag = true"
                @end="drag = false"
                class="mx-0 mt-0 mb-4 list-group"
              >
                <template #item="{ element, index }">
                  <v-card
                    variant="tonal"
                    class="mb-3 cursor-move list-group-item"
                  >
                    <v-row class="ma-0">
                      <v-col cols="auto" class="py-1" align="center">
                        <v-icon :size="18" class="pt-3">
                          mdi-drag-horizontal-variant
                        </v-icon>
                      </v-col>
                      <v-col class="pa-0">
                        <v-card-title class="pt-2 pb-0 px-0">
                          {{ element.name }}
                        </v-card-title>
                        <v-card-subtitle class="pb-3 px-0">
                          {{ element.relationship }}
                        </v-card-subtitle>
                      </v-col>
                    </v-row>
                  </v-card>
                </template>
              </draggable>
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
          :disabled="loading"
          :loading="loading"
          color="primary"
          variant="elevated"
          class="text-none"
          @click="onSave(isActive)"
        >
          Speichern
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import draggable from 'vuedraggable'

import { useMembersStore } from '@/store/members'
import { useContactsStore } from '@/store/contacts'

const emit = defineEmits(['onClose', 'onChange'])

const membersStore = useMembersStore()
const contactsStore = useContactsStore()

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

const drag = ref(false)
const dragOptions = ref({
  animation: 200,
  group: "description",
  disabled: false,
  ghostClass: "ghost"
})

const loading = ref(false)

const contacts = ref([])

const onSave = async () => {
  loading.value = true

  try {
    await membersStore.updateMember(props.memberID, {
      CONTACTS: contacts.value.map((contact) => contact.id)
    })
    emit('onChange')
    emit('onClose')
    toast.success('Reihenfolge der Kontaktpersonen wurde geändert.')
  } catch (error) {
    console.error(error)
    toast.error('Fehler beim Speichern der Reihenfolge.')
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
.flip-list-move {
  transition: transform 0.0s;
}

.no-move {
  transition: transform 0s;
}

.ghost {
  opacity: 0.0;
}

.list-group {
  min-height: 20px;
}

.list-group-item {
  cursor: move;
}

</style>
