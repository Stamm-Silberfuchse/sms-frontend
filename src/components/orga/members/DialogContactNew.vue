<template>
  <v-dialog
    width="400"
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
          mdi-plus-thick
        </v-icon>
      </v-btn>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-form
          ref="form"
          v-model="valid"
          :loading="loading"
          lazy-validation
          @submit.prevent="onSave(isActive)"
        >
          <v-card-title>
            Kontakt anlegen
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="name"
              label="Name"
              required
              :rules="nameRules"
            ></v-text-field>
            <v-combobox
              v-model="relationship"
              :label="`Beziehung zu ${membersStore.getByID(memberID)?.NAME}`"
              required
              :items="['Mutter', 'Vater', 'Oma', 'Opa', 'Tante', 'Onkel', 'Freundin', 'Freund', 'Schwester', 'Bruder']"
              :rules="relationshipRules"
            ></v-combobox>
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
    </template>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { getFirestore, collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore'

import { useMembersStore } from '@/store/members'
import { useGroupsStore } from '@/store/groups'
import { useGroupMembershipsStore } from '@/store/group_memberships'

const membersStore = useMembersStore()
const groupsStore = useGroupsStore()
const groupMembershipsStore = useGroupMembershipsStore()

const props = defineProps({
  memberID: {
    type: String,
    required: true
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
const selectedGroups = ref([])

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

const onSave = async (isActive) => {
  loading.value = true
  const { valid } = await form.value?.validate()
  if (!valid) {
    toast.info('Bitte überprüfe deine Angaben.')
    loading.value = false
    return
  }

  try {
    await membersStore.updateMember(props.memberID, {
      CONTACTS: [
        ...membersStore.getByID(props.memberID)?.CONTACTS || [],
        {
          name: name.value,
          relationship: relationship.value,
        }
      ]
    })
    props.callbackFn()
    isActive.value = false
    toast.success('Kontakt wurde angelegt.')
  } catch (error) {
    console.error(error)
    toast.error('Kontakt konnte nicht angelegt werden.')
  } finally {
    loading.value = false
  }
}
</script>
