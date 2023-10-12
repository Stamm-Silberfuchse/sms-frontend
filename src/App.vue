<template>
  <router-view />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { supabase } from '@/plugins/supabase'
import { useAuthStore } from '@/store/auth'

const session = ref()

const authStore = useAuthStore()

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
  })

  supabase.auth.onAuthStateChange((_, _session) => {
    session.value = _session
    if(_session) {
      authStore.id = _session.user.id
      authStore.email = _session.user.email
      authStore.fetchUserDetails()
    }
  })
})

</script>
