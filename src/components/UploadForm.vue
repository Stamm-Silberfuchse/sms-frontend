<template>
  <v-dialog v-model="props.showDialog" max-width="500px" @click:outside="closeDialog">
    <v-card
      @drop.prevent="onDrop($event)"
      @dragover.prevent="dragover = true"
      @dragenter.prevent="dragover = true"
      @dragleave.prevent="dragover = false"
    >
      <v-card-text>
        <v-row class="d-flex flex-column mb-8" dense align="center" justify="center">
          <v-icon :class="dragover ? 'mt-3 mb-10' : 'mt-6 mb-7'" size="60">
            mdi-cloud-upload
          </v-icon>
          <v-btn variant="outlined" class="mb-8" @click="uploader.click()">
            Auswählen
          </v-btn>
          <p class="text-center">
            Lege deine Dateien hier ab oder klicke auf Auswählen.
          </p>
          <v-file-input
            ref="uploader"
            v-model="uploadButton"
            multiple
            class="d-none"
            @update:model-value="onAdd"
          />
        </v-row>
        <v-virtual-scroll
          v-if="filesToUpload.length > 0"
          :items="filesToUpload"
          height="140"
        >
          <template v-slot:default="{ item, index }">
            <v-list-item
              :key="item?.name"
              :title="item?.name"
              :subtitle="formatBytes(item?.size)"
              class="py-2"
            >
              <template v-slot:append>
                <v-btn v-if="uploadStatus.length === 0" icon variant="text" size="small" @click.stop="removeFile(item.name)">
                  <v-icon size="default"> mdi-close-circle </v-icon>
                </v-btn>
                <v-progress-circular
                  v-else-if="uploadStatus.length < 100"
                  :model-value="uploadStatus[index]"
                  size="20"
                  color="primary"
                />
                <v-icon v-else size="default"> mdi-check </v-icon>
              </template>
            </v-list-item>
            <v-divider></v-divider>
          </template>
        </v-virtual-scroll>
        </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn icon :disabled="loading" @click="closeDialog">
          <v-icon id="close-button">
            mdi-close
          </v-icon>
        </v-btn>

        <v-btn icon :disabled="loading" @click.stop="uploadFiles()">
          <v-icon id="upload-button">
            mdi-upload
          </v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { format } from 'date-fns'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { getStorage, ref as fbRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

const emit = defineEmits(['onCloseDialog', 'onFinalize'])
const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true,
  },
  uploadDirectory: {
    type: String,
    required: true,
  }
})

const uploader = ref(null)
const dragover = ref(false)
const filesToUpload = ref([])
const uploadButton = ref([])
const loading = ref(false)
const uploadStatus = ref([])
const uploadedFiles = ref([])

const closeDialog = () => {
  emit('onCloseDialog')
  setTimeout(() => {
    filesToUpload.value = []
    uploadButton.value = []
    uploadStatus.value = []
    uploadedFiles.value = []

  }, 500)
}

const onAdd = (files) => {
  filesToUpload.value = [...filesToUpload.value, ...files]
}

const onDrop = (event) => {
  dragover.value = false
  filesToUpload.value = [...filesToUpload.value, ...event.dataTransfer.files]
}

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const removeFile = (fileName) => {
  filesToUpload.value = filesToUpload.value.filter(file => file.name !== fileName)
}

const uploadFiles = async () => {
  if (!filesToUpload.value.length > 0) {
    toast.error('Keine Dateien für den Upload ausgewählt.')
    return
  }
  loading.value = true
  let promises = []
  filesToUpload.value.forEach((file, index) => {
    promises.push(uploadFile(index, file))
    uploadStatus.value.push(0)
    uploadedFiles.value.push(null)
  })
  await Promise.all(promises)
  loading.value = false
  emit('onFinalize', uploadedFiles.value)
  closeDialog()
}

const uploadFile = async(index, file) => {
  const storage = getStorage()
  let filename = file.name
  const date = format(new Date(), 'yyyy-MM-dd-HH-mm-ss')
  filename = `${date}_${filename}`
  const metadata = { contentType: file.type }

  const strgRef = fbRef(storage, props.uploadDirectory + '/' + filename)
  const uploadTask = uploadBytesResumable(strgRef, file, metadata)

  const promise = new Promise((resolve, reject) => {
    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on('state_changed',
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        uploadStatus.value[index] = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
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
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          uploadedFiles.value[index] = {
            name: filename,
            type: file.type,
            url: downloadURL
          }
          resolve()
        })
      }
    )
  })
  return promise
}
</script>
