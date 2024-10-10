<template>
  <draggable
    class="dragArea ml-6"
    tag="div"
    handle=".handleCategory"
    item-key="id"
    :list="subgroups"
    :group="{ name: 'g1' }"
    @end="onResortedGroups"
  >
    <template #item="{ element, index }">
      <div class="mb-0">
        <v-card
          variant="flat"
          :class="`${index === 0 ? 'mt-4' : 'mt-0'} ${negativeMargin(index)}`"
          :style="`border-left: 6px solid ${element.color}`"
        >
          <v-card-text class="pa-1">
            <v-card-title class="text-h6 mb-3 pr-1 py-1">
              <v-row class="mx-0 mt-0 pb-2">
                <v-icon size="20" class="handleCategory ml-0 pr-3 pt-3 cursor-grab">
                  mdi-drag-horizontal-variant
                </v-icon>
                {{ element.name }}
                <v-spacer></v-spacer>
                <DialogGroupEdit
                  :id="element.id"
                  :name="element.name"
                  :color="element.color"
                  :callbackFn="onEditGroupCallback"
                />
                <v-btn
                  icon
                  size="x-small"
                  variant="flat"
                  @click="onDeleteGroup(element)"
                >
                  <v-icon size="x-large">
                    mdi-delete
                  </v-icon>
                </v-btn>
              </v-row>
            </v-card-title>
            <v-row class="mx-9 mb-2">
              {{ getAmountOfMembers(element.id) }} Mitglieder
            </v-row>
          </v-card-text>
        </v-card>
        <DraggableCard
          :subgroups="element.subgroups"
          :resortedCallbackFn="props.resortedCallbackFn"
          :deletedCallbackFn="props.deletedCallbackFn"
          class="pb-4"
        />
      </div>
    </template>
  </draggable>
</template>

<script setup>
import draggable from 'vuedraggable'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { useConfirm } from 'vuetify-use-dialog'

import { useGroupsStore } from '@/store/groups'
import { useRelGroupsMembersStore } from '@/store/rel_groups_members'

import DraggableCard from '@/components/orga/groups/DraggableCard.vue'
import DialogGroupEdit from '@/components/orga/groups/DialogGroupEdit.vue'

const props = defineProps({
  subgroups: {
    required: true,
    type: Array
  },
  resortedCallbackFn: {
    type: Function,
    default: null
  },
  deletedCallbackFn: {
    type: Function,
    default: null
  }
})

const createConfirm = useConfirm()

const groupsStore = useGroupsStore()

const onDeleteGroup = async (el) => {
  const isConfirmed = await createConfirm({
    title: 'Gruppe löschen',
    content: 'Bist Du sicher?',
  })
  if (!isConfirmed) return

  if (el.subgroups?.length > 0) {
    toast.error('Gruppe kann nicht gelöscht werden, da sie noch Unterkategorien enthält.')
    return
  }
  await groupsStore.deleteGroup(el.id)
    .catch((error) => {
      toast.error('Fehler beim Löschen der Gruppe.')
    })
  // find parent:
  const parent = groupsStore.getGroupByChild(el.id)
  if(!!props.deletedCallbackFn) {
    console.log("calling deletedCallbackFn")
    await props.deletedCallbackFn()
  }
  toast.success('Gruppe gelöscht.')
}

const onResortedGroups = () => {
  if(!!props.resortedCallbackFn) props.resortedCallbackFn()
}

const negativeMargin = (index) => {
  if (index > 0 && props.subgroups[index - 1]?.subgroups?.length > 0) {
    return 'mt-n4'
  }
}

const getAmountOfMembers = (groupId) => {
  return groupsStore.getAmountOfMembers(groupId)
}
</script>

<style scoped>
</style>
