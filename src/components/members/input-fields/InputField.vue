<template>
  <div>
    <v-text-field
      v-if="props.type === 'TEXT'"
      :label="props.label"
      v-model="myModel"
    ></v-text-field>
    <v-checkbox
      v-else-if="props.type === 'BOOL'"
      :label="props.label"
      v-model="myModel"
    ></v-checkbox>
    <v-checkbox
      v-else-if="props.nameIntern === 'COUNRTY'"
      :label="props.label"
      v-model="myModel"
    ></v-checkbox>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  type: {
    default: 'TEXT',
    type: String
  },
  model: [String, Number, Boolean],
  label: {
    default: '',
    type: String
  },
  nameIntern: {
    default: '',
    type: String
  }
})

const emit = defineEmits(['update:model'])

const myModel = computed({
  get() {
    return props.myModel
  },
  set(value) {
    emit('update:model', value)
  }
})

</script>
