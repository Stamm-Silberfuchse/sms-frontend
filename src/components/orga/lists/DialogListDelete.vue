<template>
  <v-tooltip location="start" text="Liste löschen">
    <template v-slot:activator="{ props: tooltipProps }">
      <v-icon
        v-if="!loading"
        ref="activatorRef"
        v-bind="tooltipProps"
        @click="onDelete"
      >
        mdi-delete
      </v-icon>
      <v-progress-circular
        v-else
        indeterminate
      />
    </template>
  </v-tooltip>
</template>

<script setup>
import { ref} from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { useConfirm } from 'vuetify-use-dialog'

import { useMemberListsStore } from '@/store/member_lists'

const createConfirm = useConfirm()

const memberListsStore = useMemberListsStore()

const props = defineProps({
  list: {
    type: Object,
    required: true,
  },
  onDeleteCallbackFn: {
    type: Function,
    required: true,
  }
})

const loading = ref(false)

const onDelete = async (uid) => {
  const isConfirmed = await createConfirm({
    title: `Liste '${props.list?.name}' löschen`,
    content: 'Bist Du sicher?',
  })
  if (!isConfirmed) return

  loading.value = true
  try {
    await memberListsStore.deleteMemberList(props.list?.id)
    props.onDeleteCallbackFn()
    toast.success(`Liste '${props.list?.name}' wurde gelöscht`)
  } catch (error) {
    toast.error(`Liste '${props.list?.name}' konnte nicht gelöscht werden.`)
  } finally {
    loading.value = false
  }
}
</script>
