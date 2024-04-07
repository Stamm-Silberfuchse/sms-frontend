<template>
  <v-row class="mx-0">
    <v-card elevation="0" class="w-100 mb-2 pa-2">
      <v-row class="px-2">
        <v-col cols="auto" align-self="center" class="pt-3">
          <v-icon size="20" class="handler-list cursor-move">
            mdi-drag-horizontal-variant
          </v-icon>
        </v-col>
        <v-col cols="auto" align-self="center" class="pl-2 pt-3">
          {{ index + 1 }}. Spalte
        </v-col>
        <v-col class="pl-2 pt-3">
          <v-select
            v-model="column"
            :items="fields"
            item-title="name"
            return-object
            density="compact"
            hide-details
            @update:model-value="onSelected($event)"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props" :subtitle="item.raw.category"></v-list-item>
            </template>
          </v-select>
        </v-col>
        <v-col cols="auto" align-self="center" class="py-2 pl-2">
          <v-btn
            icon
            size="x-small"
            variant="flat"
            @click="onDeleteColumn(element)"
          >
            <v-icon>
              mdi-window-close
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-row>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import { memberFields } from '@/plugins/sms-helper'

const props = defineProps({
  element: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  deletedCallbackFn: {
    type: Function,
    required: true
  },
  changedCallbackFn: {
    type: Function,
    required: true
  }
})

const column = ref(props.element)

const fields = ref(memberFields)

const onDeleteColumn = async (col) => {
  props.deletedCallbackFn(col)
}

onMounted(() => {
  column.value = fields.value.find(f => f.id === props.element.key) || null
})

const onSelected = (event) => {
  props.changedCallbackFn(event, props.index)
}

</script>

<style scoped>
</style>
