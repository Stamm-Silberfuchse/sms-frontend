<template>
  <v-dialog
    width="480"
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
                      <v-card-text class="px-4 text-body-1 py-0">
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
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { db } from '@/plugins/firebase'
import { doc, arrayUnion, arrayRemove, updateDoc } from 'firebase/firestore'

import { useGroupsStore } from '@/store/groups'

const emit = defineEmits(['onSave'])

const groupsStore = useGroupsStore()

const props = defineProps({
  memberID: {
    type: String,
    required: true
  },
  groups: {
    type: Array,
    required: true
  }
})

const loading = ref(false)
const selectedGroups = ref([])

onMounted(() => {
  selectedGroups.value = props.groups
})


const groups = computed(() => {
  return groupsStore.getList
})

const updateGroupMembership = async (groupID, memberID, value) => {
  if (value) {
    // member belongs to group
    await updateDoc(doc(db, 'groups', groupID), {
      members: arrayUnion(memberID)
    })
    await updateDoc(doc(db, 'members', memberID), {
      GROUPS: arrayUnion(groupID)
    })
  } else {
    // member does not belong to group
    await updateDoc(doc(db, 'groups', groupID), {
      members: arrayRemove(memberID)
    })
    await updateDoc(doc(db, 'members', memberID), {
      GROUPS: arrayRemove(groupID)
    })
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
  await groupsStore.fetchAll()
  emit('onSave')
  toast.success('Gruppenzugehörigkeit wurde geändert.')
  loading.value = false
  isActive.value = false
}
</script>
