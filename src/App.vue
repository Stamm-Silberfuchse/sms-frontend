<template>
  <router-view />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { supabase } from '@/plugins/supabase'
import { useUserStore } from '@/store/user'

const session = ref()

const userStore = useUserStore()

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
  })

  supabase.auth.onAuthStateChange((_, _session) => {
    session.value = _session
    if(_session) {
      userStore.id = _session.user.id
      userStore.email = _session.user.email
      userStore.fetchUserDetails()
    }
  })
})

</script>
