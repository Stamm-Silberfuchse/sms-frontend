<template>
  <div>
    <v-menu
      rounded
      offset-y
      location="bottom"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          icon
          :size="size-16"
          v-bind="props"
          :ripple="false"
        >
          <v-avatar
            color="primary"
            :size="size"
          >
            <v-img
              v-if="photoAvailable"
              :src="authStore?.photoURL"
              :alt="authStore?.displayName"
              :title="authStore?.displayName"
              :aspect-ratio="1"
              cover
              class="elevation-2"
            ></v-img>
            <span v-else-if="!avatarUploadLoading" class="font-black text-h4 font-Quicksand">
              {{ initials }}
            </span>
            <v-overlay
              v-model="avatarUploadLoading"
              contained
              :opacity="0.7"
              scrim="#000"
              class="align-center justify-center"
            >
              <v-progress-circular :model-value="avatarUploadProgress" color="white" />
            </v-overlay>
          </v-avatar>
        </v-btn>
      </template>
      <v-list>
        <v-list-item  v-if="!photoAvailable" @click="uploader.click()">
          <v-list-item-title>Bild hinzufügen</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="photoAvailable" @click="onRemoveAvatar">
          <v-list-item-title>Bild entfernen</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-file-input
      ref="uploader"
      v-model="imageFile"
      accept="image/png, image/jpeg, image/bmp"
      class="d-none"
      type="file"
      @change="onFileChanged"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import {
  getFirestore, doc, setDoc
} from 'firebase/firestore'
import {
  getStorage,
  ref as fbRef,
  uploadBytesResumable,
  getDownloadURL
} from 'firebase/storage'
import {
  getAuth,
  updateProfile as fbUpdateProfile,
} from 'firebase/auth'

import {
  useAuthStore,
} from '@/store/auth'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const uploader = ref(null)
const imageFile = ref(null)

const avatarUploadLoading = ref(false)
const avatarUploadProgress = ref(0)

const authStore = useAuthStore()

const props = defineProps({
  size: {
    type: [ Number, String ],
    default: 'default'
  }
})

const initials = computed(() => {
  if(authStore?.displayName == undefined) return ''
  return authStore?.displayName.split(' ').map(n => n[0]).join('')
})

const photoAvailable = computed(() => {
  return !!authStore?.photoURL && authStore?.photoURL.length > 0
})

const onFileChanged = async () => {
  if(imageFile.value == null) return
  avatarUploadLoading.value = true
  const file = imageFile.value[0]
  const auth = getAuth()
  const storage = getStorage()
  let filename = file.name
  const uid = auth.currentUser.uid
  const date = format(new Date(), 'yyyy-MM-dd-HH-mm-ss')
  filename = `${date}_${uid}_${filename}`

  const metadata = {
    contentType: file.type
  }

  // Upload file and metadata to the object 'images/mountains.jpg'
  const storageRef = fbRef(storage, 'avatars/' + filename);
  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  // Listen for state changes, errors, and completion of the upload.
  uploadTask.on('state_changed',
    (snapshot) => {
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      avatarUploadProgress.value = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      switch (snapshot.state) {
        case 'paused':
          toast.info('Upload wurde pausiert.')
          break;
        case 'running':
          break;
      }
    },
    (error) => {
      // A full list of error codes is available at
      // https://firebase.google.com/docs/storage/web/handle-errors
      switch (error.code) {
        case 'storage/unauthorized':
          toast.error('Du hast keine Berechtigung, um diese Datei hochzuladen.')
          break;
        case 'storage/canceled':
          toast.error('Upload wurde abgebrochen.')
          break;
        case 'storage/unknown':
          toast.error('Ein unbekannter Fehler ist aufgetreten.')
          break;
        default:
          toast.error(error.code)
          break;
      }
      avatarUploadLoading.value = false
    },
    () => {
      // Upload completed successfully, now we can get the download URL
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        fbUpdateProfile(auth.currentUser, {
          photoURL: downloadURL,
        }).then(async () => {
          const db = getFirestore()
          const docRef = doc(db, 'users', auth.currentUser.uid)
          await setDoc(docRef, { photoURL: downloadURL }, { merge: true })
        }).then(() => {
          authStore.photoURL = downloadURL
        })
        .catch((error) => {
          console.error(error)
          toast.error('Fehler beim Erhalt der DownloadURL.')
        }).finally(() => {
          avatarUploadLoading.value = false
          setTimeout(() => { avatarUploadProgress.value = 0 }, 1000)
        })
      })
    }
  )
}

const onRemoveAvatar = async() => {
  imageFile.value = null
  avatarUploadLoading.value = true
  const auth = getAuth()
  await fbUpdateProfile(auth.currentUser, {
    photoURL: '',
  }).catch((error) => {
    console.error(error)
    toast.error('Fehler beim Löschen des Bilds.')
    throw error
  })
  const db = getFirestore()
  const docRef = doc(db, 'users', auth.currentUser.uid)
  await setDoc(docRef, { photoURL: null }, { merge: true })
  authStore.photoURL = null
  avatarUploadLoading.value = false
  return
}
</script>

<style lang="scss">
.v-skeleton-loader > div > div {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.v-badge {
  $badge-dot-height: 20px;
  $badge-dot-width: 20px;
}
</style>
