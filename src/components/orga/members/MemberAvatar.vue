<template>
  <div>
    <v-hover v-slot="{ isHovering, props }">
      <v-avatar
        color="grey"
        size="150"
        rounded="0"
        v-bind="props"
      >
        <v-img cover :src="member['PHOTO_URL']">
          <v-row justify="end" :class="`mt-1 mr-1 avatar-buttons ${isHovering ? 'on-hover' : ''}`">
            <v-menu
              min-width="200px"
              rounded
              offset-y
              location="bottom"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  variant="flat"
                  :class="`mr-0`"
                  color="primary"
                  size="x-small"
                  icon
                  v-bind="props"
                >
                  <v-icon size="x-large">
                    mdi-dots-vertical
                  </v-icon>
                </v-btn>
              </template>
              <v-list density="compact">
                <v-list-item v-if="photoAvailable" @click="uploadForm.click()">
                  <v-list-item-title>Bild ändern</v-list-item-title>
                </v-list-item>
                <v-list-item v-if="photoAvailable" @click="onRemovePhoto">
                  <v-list-item-title>Bild entfernen</v-list-item-title>
                </v-list-item>
                <v-list-item v-else @click="uploadForm.click()">
                  <v-list-item-title>Bild hinzufügen</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-row>
          <div class="avatar-overlay-center">
            <v-progress-circular
              v-if="uploadLoading"
              :value="avatarUploadProgress"
              color="white"
              class="progress-loader"
            ></v-progress-circular>
            <v-icon
              v-if="resizing"
              color="white"
              :size="40"
              class="progress-loader"
            >
              mdi-image-sync-outline
            </v-icon>
            <v-icon
              v-else-if="notAvailable"
              color="white"
              :size="40"
              class="progress-loader"
            >
              mdi-image-off-outline
            </v-icon>
          </div>
        </v-img>
      </v-avatar>
    </v-hover>
    <v-file-input
      ref="uploadForm"
      v-model="imageFile"
      accept="image/*"
      class="d-none"
      type="file"
      @change="onFileChanged"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storage, db } from '@/plugins/firebase'
import { getAuth } from 'firebase/auth'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { ref as fbRef, uploadBytesResumable } from 'firebase/storage'
import { format } from 'date-fns'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useMembersStore } from '@/store/members'

const membersStore = useMembersStore()

const uploadForm = ref(null)
const imageFile = ref(null)

const uploadLoading = ref(false)
const avatarUploadProgress = ref(0)

const resizing = ref(false)

const memberBinding = ref(null)

const props = defineProps({
  memberID: {
    type: String,
    required: true,
  },
})

const member = computed(() => {
  return membersStore.getByID(props.memberID)
})

const notAvailable = computed(() => {
  return !uploadLoading.value && (member.value['PHOTO_URL']?.length === 0 || false)
})

const photoAvailable = computed(() => {
  return !!member.value['PHOTO_URL'] && member.value['PHOTO_URL'].length > 0 && member.value['PHOTO_URL'] !== '/avatar_blank.webp'
})

const onFileChanged = async () => {
  if(imageFile.value == null) return
  uploadLoading.value = true
  console.log(imageFile)
  let filename = imageFile.value.name
  const date = format(new Date(), 'yyyy-MM-dd-HH-mm-ss')
  filename = `${props.memberID}_${date}__${filename}`
  const metadata = {
    contentType: imageFile.value.type,
    customMetadata: {
      memberID: props.memberID,
      userID: getAuth().currentUser.uid,
    }
  }

  const storageRef = fbRef(storage, 'memberAvatars/' + filename)
  const uploadTask = uploadBytesResumable(storageRef, imageFile.value, metadata)

  uploadTask.on('state_changed',
    (snapshot) => {
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
      uploadLoading.value = false
    },
    async () => {
      const docRef = doc(db, 'members', props.memberID)
      await setDoc(docRef, { PHOTO_URL: 'pending' }, { merge: true })
        .catch((error) => {
          console.error(error)
          toast.error('Fehler beim Setzen des Dokuments.')
        })
      bindMember()
      resizing.value = true
      uploadLoading.value = false
      setTimeout(() => { avatarUploadProgress.value = 0 }, 1000)
    }
  )
}

const bindMember = () => {
  const q = doc(db, "members", props.memberID)
  memberBinding.value = onSnapshot(q, { includeMetadataChanges: true }, async (doc) => {
    const data = doc.data()
    if(data.PHOTO_URL !== 'pending') {
      await membersStore.fetchMember(props.memberID)
      unbindMember()
      resizing.value = false
    }
  })
  console.log("binded")
}

const unbindMember = () => {
  memberBinding.value()
}

const onRemovePhoto = async () => {
  const payload = {
    PHOTO_URL: '/avatar_blank.webp',
  }
  await membersStore.updateMember(props.memberID, payload)
    .catch((error) => {
      console.error(error)
      toast.error('Fehler beim Löschen des Bildes.')
      return
    })
  await membersStore.fetchMember(props.memberID)
  toast.success('Bild wurde gelöscht.')
}

</script>

<style scoped>
.avatar-buttons {
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}
.avatar-buttons.on-hover {
  opacity: 1;
}

.avatar-overlay-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
