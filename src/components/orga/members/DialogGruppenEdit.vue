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
        @click="setGroupMemberships"
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
                <v-card-title>
                  Gruppenzugehörigkeit bearbeiten
                </v-card-title>
              </v-row>
              <v-row>
                <v-col cols="12" class="pb-0">
                  <template v-for="(group, idx) in groups" :key="group.id">
                    <v-card
                      variant="tonal"
                      :class="`ml-${(10 - group.level) * 3} mb-2 select-group-card`"
                      :style="`border-left: 6px solid ${group.color}`"
                    >
                      <v-card-text class="px-4 text-body-1 py-1">
                        <v-checkbox
                          v-model="selectedGroups"
                          :value="group.id"
                          :label="group.name"
                          :color="group.color"
                          density="comfortable"
                          hide-details
                        ></v-checkbox>
                      </v-card-text>
                    </v-card>
                  </template>
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
import { getFirestore, collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore'

import { useGroupsStore } from '@/store/groups'
import { useGroupMembershipsStore } from '@/store/group_memberships'

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
  groups: {
    type: Array,
    required: true
  }
})

const loading = ref(false)
const selectedGroups = ref([])

onMounted(() => {
  setGroupMemberships()
})

const setGroupMemberships = async () => {
  selectedGroups.value = groupMembershipsStore.getByMemberID(props.memberID).map((el) => el.groupID)
}

const groups = computed(() => {
  return groupsStore.getAllSorted?.sort((a, b) => a.order - b.order)
})

const updateGroupMembership = async (groupID, memberID, value) => {
  const db = getFirestore()
  if (value) {
    // member belongs to group
    const q = query(collection(db, 'group_memberships'), where('memberID', '==', memberID), where('groupID', '==', groupID))
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) {
      // document does not yet exist
      await addDoc(collection(db, 'group_memberships'), {
        memberID: memberID,
        groupID: groupID
      })
    } // else: document already exists
  } else {
    // member does not belong to group
    const q = query(collection(db, 'group_memberships'), where('memberID', '==', memberID), where('groupID', '==', groupID))
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      console.log(querySnapshot.size)
      for (let k=0; k<querySnapshot.size; k++) {
        await deleteDoc(querySnapshot.docs[k].ref)
      }
    }
  }
}

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
  await groupMembershipsStore.fetchAll()
  toast.success('Gruppenzugehörigkeit wurde geändert.')
  loading.value = false
  isActive.value = false
}
</script>
