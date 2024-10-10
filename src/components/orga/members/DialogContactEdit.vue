<template>
  <v-dialog
    width="600"
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
          @submit.prevent="onSave(isActive)"
        >
          <v-card-text class="py-2">
            <v-container>
              <v-row>
                <v-card-title class="w-100">
                  <v-text-field
                    v-model="name"
                    label="Name Kontaktperson"
                    required
                    :rules="nameRules"
                  ></v-text-field>
                  <v-text-field
                    v-model="name"
                    :label="`Beziehung zu ${member['FIRST_NAME']}`"
                    required
                  ></v-text-field>
                </v-card-title>
              </v-row>
              <v-row>
                <v-col cols="12" class="pb-0">
                  <template v-for="(field, idx) in contact?.fields" :key="field.id">

                  </template>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn
              color="error"
              variant="elevated"
              prepend-icon="mdi-delete"
              class="text-none"
              @click="onDeleteContact"
            >
              Löschen
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              class="text-none"
              @click="isActive.value = false"
            >
              Abbrechen
            </v-btn>
            <v-btn
              :disabled="loading"
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
import { ref, computed, watch, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useMembersStore } from '@/store/members'
import { useGroupsStore } from '@/store/groups'
import { useContactsStore } from '@/store/contacts'

const membersStore = useMembersStore()
const groupsStore = useGroupsStore()
const contactsStore = useContactsStore()

const props = defineProps({
  memberID: {
    type: String,
    required: true
  },
  contactID: {
    type: Function,
    required: true
  },
})

const loading = ref(false)

const name = ref('')

const contact = computed(() => {
  return contactsStore.getByID(props.contactID)
})

const member = computed(() => {
  return membersStore.getByID(props.memberID)
})

const onSave = async (isActive) => {
  loading.value = true

  let promises = []

  groups.value?.forEach(async (group) => {
    if (selectedGroups.value.includes(group.id)) {
      promises.push(updateGroupMembership(group.id, props.memberID, true))
    } else {
      promises.push(updateGroupMembership(group.id, props.memberID, false))
    }
  })

  await Promise.all(promises)
  toast.success('Gruppenzugehörigkeit wurde geändert.')
  loading.value = false
  isActive.value = false
}

const onDeleteContact = async (isActive) => {
  loadingDelete.value = true
  await contactsStore.deleteContact(props.contactID)

}
</script>
