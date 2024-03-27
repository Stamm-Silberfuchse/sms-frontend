<template>
  <v-avatar
    color="primary"
    :size="size"
    @click="!!props.to ? $router.push(props.to) : null"
    :class="!!props.to ? 'avatar-pointer' : ''"
  >
    <v-img
      v-if="user?.photoURL?.length > 0"
      :src="user?.photoURL"
      :alt="user?.displayName"
      :aspect-ratio="1"
      cover
      class="elevation-2"
    ></v-img>
    <span v-else class="font-Quicksand">
      {{ getInitials(user?.displayName) }}
    </span>
    <v-tooltip
      v-if="tooltip"
      activator="parent"
      :location="tooltipLocation"
      class="text-pre-wrap"
    >
      {{ tooltipPrepend }} {{ tooltipText }} {{ tooltipAppend }}
    </v-tooltip>
  </v-avatar>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUsersStore } from '@/store/users'

const usersStore = useUsersStore()

const props = defineProps({
  userID: {
    required: true
  },
  to: {
    type: [ Boolean, String, Object ],
    default: null
  },
  size: {
    type: [ Number, String ],
    default: 'default'
  },
  tooltip: {
    type: [String, Boolean],
    default: false
  },
  tooltipLocation: {
    type: String,
    default: 'end'
  },
  tooltipPrepend: {
    type: String,
    default: ''
  },
  tooltipAppend: {
    type: String,
    default: ''
  }
})

const user = computed(() => {
  if(props.userID == null) return null
  return usersStore.getByID(props.userID)
})

const getInitials = (full_name) => {
  if(full_name == null) return ''
  return full_name.split(' ').map(n => n[0]).join('')
}

const tooltipText = computed(() => {
  switch(typeof props.tooltip) {
    case 'string':
      return props.tooltip
    case 'boolean':
      return props.tooltip ? user.value?.displayName : 'sollte nicht angezeigt werden'
    default:
      return '-'
  }
})

</script>

<style scoped>
.v-skeleton-loader > div > div {
  margin-left: 0 !important;
  margin-right: 0 !important;
}
.avatar-pointer {
  cursor: pointer;
}
</style>
