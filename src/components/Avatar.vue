<template>
  <v-avatar>
    <template v-if="loading" >
      <v-skeleton-loader type="avatar" />
    </template>
    <template v-else>
      <v-avatar
        :color="photoAvailable ? 'primary' : 'primary'"
        :size="size"
      >
        <v-img
          v-if="photoAvailable"
          :src="user?.avatar_url"
          :alt="user?.full_name"
          :aspect-ratio="1"
          class="elevation-2"
        ></v-img>
        <span v-else class="font-quicksand font-bold">
          {{ getInitials(user?.full_name) }}
        </span>
        <v-tooltip
          activator="parent"
          :location="tooltipLocation"
          class="text-pre-wrap"
        >
          {{ tooltipAppend }}{{ user?.full_name }}
        </v-tooltip>
      </v-avatar>
    </template>
  </v-avatar>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { supabase } from '@/plugins/supabase'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const loading = ref(false)

const user = ref(null)

const props = defineProps({
  memberID: {
    required: true
  },
  to: {
    type: [ String, Boolean ],
    default: null
  },
  size: {
    type: [ Number, String ],
    default: 'default'
  },
  tooltipLocation: {
    type: String,
    default: 'end'
  },
  tooltipAppend: {
    type: String,
    default: ''
  }
})

const fetchData = () => {
  if(props.memberID === undefined ) return
  loading.value = true
  supabase.from('profiles').select('*').eq('id', props.memberID).single()
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
  if(full_name == null) return ''
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
