<template>
  <v-dialog v-model="showDialog" width="340">
    <template v-slot:activator>
      <v-tooltip location="start" text="Liste umbenennen">
        <template v-slot:activator="{ props: tooltipProps }">
          <v-icon
            ref="activatorRef"
            v-bind="tooltipProps"
            @click="showDialog = true"
          >
            mdi-pencil
          </v-icon>
        </template>
      </v-tooltip>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-form
          ref="form"
          v-model="valid"
          :loading="loading"
          lazy-validation
          @submit.prevent="onSave"
        >
          <v-card-title>
            Liste umbennen
          </v-card-title>
          <v-card-subtitle class="text-wrap">
            Gib einen neuen Namen für die Liste '{{ props.list?.name }}' ein.
          </v-card-subtitle>
          <v-card-text>
            <v-text-field
              v-model="name"
              label="Name"
              required
              autofocus
              :rules="nameRules"
            ></v-text-field>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn
              variant="text"
              class="text-none"
              :disabled="loading"
              @click="onAbort(isActive)"
            >
              Abbrechen
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              :disabled="loading || !valid"
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
import { ref, watch} from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { useConfirm } from 'vuetify-use-dialog'

import { useMemberListsStore } from '@/store/member_lists'

const emit = defineEmits(['edit'])

const createConfirm = useConfirm()

const memberListsStore = useMemberListsStore()

const props = defineProps({
  list: {
    type: Object,
    required: true,
  }
})

const loading = ref(false)

const showDialog = ref(false)

const name = ref(props.list?.name)

const form = ref(null)
const valid = ref(false)

const nameRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte gib einen Namen an.'
  },
])

const onSave = async () => {
  const { valid } = await form.value?.validate()
  if (!valid) {
    toast.info('Bitte überprüfe deine Angaben.')
    loading.value = false
    return
  }

  const isConfirmed = await createConfirm({
    title: 'Liste umbennen?',
    content: 'Bist Du sicher?',
  })
  if (!isConfirmed) return

  loading.value = true
  const payload = {
    name: name?.value,
  }
  try {
    await memberListsStore.updateMemberList(props.list?.id, payload)
    props.onEditCallbackFn(name.value)
    showDialog.value = false
    toast.success(`Liste '${props.list?.name}' wurde in '${name.value}' umbenannt`)
  } catch (error) {
    toast.error(`Liste '${props.list?.name}' konnte nicht umbenannt werden.`)
  } finally {
    loading.value = false
  }
}

const onAbort = () => {
  showDialog.value = false
  loading.value = false
  form.value?.reset()
}

watch(() => props.list, () => {
  name.value = props.list?.name
})

</script>
