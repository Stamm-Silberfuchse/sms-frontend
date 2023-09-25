<template>
  <VAvatar>
    <template v-if="loading" >
      <v-skeleton-loader type="avatar" />
    </template>
    <template v-else>
      <v-avatar
        :color="photoAvailable ? 'transparent' : 'primary'"
      >
        <v-img
          v-if="photoAvailable"
          :src="user?.avatar_url"
          :alt="user?.full_name"
          :title="user?.full_name"
          :width="size"
          :height="size"
          :aspect-ratio="1"
          class="elevation-2"
        ></v-img>
        <span v-else class="font-quicksand font-bold">
          {{ getInitials(user?.full_name) }}
        </span>
        <v-tooltip
          activator="parent"
          location="end"
        >
          {{ user?.full_name }}
        </v-tooltip>
      </v-avatar>
    </template>
  </VAvatar>
</template>

<script setup>
import { ref, computed } from 'vue'
import { supabase } from '@/plugins/supabase'

const loading = ref(false)

const user = ref(null)

const props = defineProps({
  authorID: {
    type: String,
    required: true
  },
  to: {
    type: [ String, Boolean ],
    default: null
  },
})

const fetchData = () => {
  loading.value = true
  supabase.from('profiles').select('*').eq('id', props.authorID).single()
    .then(async ({ data, error, status }) => {
      if (error && status !== 406) throw error

      if(data) {
        user.value = data
      }
    })
    .catch((error) => {
      console.error(error)
      toast.error(error.message)
    })
    .finally(() =>{
      loading.value = false
    })
}

fetchData()

const getInitials = (full_name) => {
  return full_name.split(' ').map(n => n[0]).join('')
}

const photoAvailable = computed(() => {
  return user.value?.avatar_url != null && user.value?.avatar_url.length > 0
})
</script>

<style>
.v-skeleton-loader > div > div {
  margin-left: 0 !important;
  margin-right: 0 !important;
}
</style>
