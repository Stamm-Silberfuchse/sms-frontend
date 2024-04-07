<template>
  <v-dialog width="400">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        prependIcon="mdi-playlist-star"
        class="mr-4 mb-4 text-none"
      >
        Default Liste festlegen
      </v-btn>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-form
          ref="form"
          v-model="valid"
          :loading="loading"
          lazy-validation
          @submit.prevent="onSetDefaultList(isActive)"
        >
          <v-card-title>
            Default Liste festlegen
          </v-card-title>
          <v-card-text>
            <v-select
              v-model="defaultList"
              :items="lists"
              item-title="name"
              item-value="id"
              return-object
              label="Default Liste"
              required
            />
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
import { ref, computed } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useMemberListsStore } from '@/store/member_lists'

const memberListsStore = useMemberListsStore()

const loading = ref(false)

const form = ref(null)
const valid = ref(false)

const lists = computed(() => memberListsStore.getAll)

const defaultList = ref(lists.value?.find((list) => list.default) || null)

const onSetDefaultList = async (isActive) => {
  loading.value = true
  const { valid } = await form.value?.validate()
  if (!valid) {
    toast.info('Bitte überprüfe deine Angaben.')
    loading.value = false
    return
  }

  try {
    await memberListsStore.updateMemberList(
      memberListsStore.getDefault?.id,
      { default: false }
    )
    await memberListsStore.updateMemberList(defaultList.value.id, { default: true })
    isActive.value = false
    toast.success(`Default Liste '${defaultList.value.name}' festgelegt`)
  } catch (error) {
    toast.error(`Fehler beim Setzen des Defaults der Liste '${defaultList.value.name}'.`)
  } finally {
    loading.value = false
  }
}

const onAbort = (isActive) => {
  isActive.value = false
  form.value?.reset()
}

</script>
