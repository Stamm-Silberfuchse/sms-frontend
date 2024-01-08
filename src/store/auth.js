import { defineStore } from 'pinia'
import { getAuth, updateProfile as fbUpdateProfile, verifyPasswordResetCode as fbVerifyPasswordResetCode, updatePassword as fbUpdatePassword } from 'firebase/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    uid: null,
    email: null,
    displayName: null,
    emailVerified: null,
    phoneNumber: null,
    photoURL: { original: null, x128: null, x512: null, x1024: null },
    isAnonymous: null,
    tenantId: null,
    metadata: null,
    role: null,
  }),
  getters: {
    isAdmin: (state) => {
      return state.role === 'admin'
    },
  },
  actions: {
    async updateProfile(payload) {
      const auth = getAuth()
      fbUpdateProfile(auth.currentUser, payload)
        // TODO: CLOUD FUNCTION
        // update firestore entry
        // const docRef = doc(db, 'users', auth.currentUser.uid)
        // await setDoc(docRef, payload, { merge: true })
        .catch((error) => {
          console.error(error)
          throw error
        }).then(async () => {
          await this.reloadCurrentUser()
        })
    },
    set(user) {
      const auth = getAuth()
      this.uid = user.uid
      this.email = user.email
      this.displayName = user.displayName
      this.emailVerified = user.emailVerified
      this.phoneNumber = user.phoneNumber
      this.photoURL = user.photoURL
      this.isAnonymous = user.isAnonymous
      this.tenantId = user.tenantId
      this.metadata = user.metadata
      auth.currentUser.getIdTokenResult()
        .then((idTokenResult) => {
          this.role = idTokenResult.claims.role
        })
        .catch((error) => {
          console.error(error)
          throw error
        })
    },
    async reloadCurrentUser() {
      const auth = getAuth()
      await auth.currentUser.reload()
      this.set(auth.currentUser)
    },
    async setInitialPassword(oobCode, newPassword) {
      await fbVerifyPasswordResetCode(getAuth(), oobCode)
        .then((email) => {
          const accountEmail = email
          console.log(accountEmail, newPassword)
        })
        .catch((error) => {
          console.error(error)
        })
    },
    async setPassword(newPassword) {
      const auth = getAuth()
      await fbUpdatePassword(auth.currentUser, newPassword)
        .catch((error) => {
          console.error(error)
          throw error
        })
    }
  }
})
