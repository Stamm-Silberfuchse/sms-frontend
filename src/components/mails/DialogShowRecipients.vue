<template>
  <v-dialog
    v-model="props.showDialog"
    width="480"
    @click:outside="onAbort"
  >
    <v-card :loading="loading">
      <v-card-title>
        {{ recipients.length }} Empfänger*innen:
      </v-card-title>

      <v-divider></v-divider>

      <v-virtual-scroll
        :items="recipients"
        height="320"
        item-height="48"
        class="py-2"
      >
        <template v-slot:default="{ item }">
          <v-list-item
            :title="item.FIRST_NAME + ' ' + item.LAST_NAME"
            class="py-1"
          >
            <template v-slot:prepend>
              <v-avatar
                :color="item.color"
                tile
                class="text-white"
                size="40"
              >
                <v-img
                  :src="item.PHOTO_URL"
                  alt="avatar"
                ></v-img>
              </v-avatar>
            </template>
          </v-list-item>
        </template>
      </v-virtual-scroll>
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

import { useMembersStore } from '@/store/members'
import { useContactsStore } from '@/store/contacts'
import { useRelGroupsMembersStore } from '@/store/rel_groups_members'

const emit = defineEmits(['onClose'])

const membersStore = useMembersStore()
const contactsStore = useContactsStore()
const relGroupsMembersStore = useRelGroupsMembersStore()

const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false
  },
  groups: {
    type: Array,
    required: true
  },
  events: {
    type: Array,
    required: true
  },
  members: {
    type: Array,
    required: true
  }
})

const loading = ref(false)
const recipients = ref([])

const loadRecipients = async () => {
  loading.value = true
  recipients.value = []
  let recipientIDs = []
  // add by group
  for (const groupID of props.groups) {
    const rels = relGroupsMembersStore.getByGroupID(groupID)
    recipientIDs = recipientIDs.concat(rels?.map(rel => rel.memberID))
  }
  // add by members
  recipientIDs = recipientIDs.concat(props.members)
  // remove duplicates
  recipientIDs = [...new Set(recipientIDs)]
  for (let i = 0; i < recipientIDs.length; i++) {
    const member = membersStore.getByID(recipientIDs[i])
    recipients.value.push(member)
  }
  // sort by first name
  recipients.value.sort((a, b) => a.FIRST_NAME.localeCompare(b.FIRST_NAME))
  loading.value = false
}

const onAbort = () => {
  emit('onClose')
}

watch(() => props.showDialog, async (value) => {
  if (value) {
    await loadRecipients()
  }
})
</script>
