<template>
  <router-view />
</template>

<script setup>
import { getAuth, onAuthStateChanged } from 'firebase/auth'

import { useAuthStore } from '@/store/auth'
import { useUsersStore } from '@/store/users'

const auth = getAuth()
const authStore = useAuthStore()
const usersStore = useUsersStore()

onAuthStateChanged(auth, async (user) => {
  if (user) {
    authStore.set(user)
    usersStore.fetchUser(user.uid)
    usersStore.bind()
    // authStore.photoURL = { ...authStore.photoURL, original: user.photoURL }
    // check user role
    await auth.currentUser.getIdTokenResult()
      .then((idTokenResult) => {
        authStore.role = idTokenResult.claims.role
      })
      .catch((error) => {
        console.error(error)
      })
  } else {
    usersStore.unbind()
    authStore.$reset()
  }
})
</script>
