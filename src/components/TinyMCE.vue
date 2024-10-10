<template>
  <Editor :init="tinyMCEOptions" :api-key="tinyMCEAPIKey" v-model="body" />
</template>

<script setup>
import Editor from '@tinymce/tinymce-vue'

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
})

const tiny_media_upload_handler = (blobInfo, progress) => {
  return new Promise((resolve, reject) => {
    const file = blobInfo.blob()
    const auth = getAuth()
    const storage = getStorage()
    let filename = file.name
    const uid = auth.currentUser.uid
    const date = format(new Date(), 'yyyy-MM-dd-HH-mm-ss')
    filename = `${date}_${uid}_${filename}`

    const metadata = {
      contentType: file.type
    };

    // Upload file and metadata to the object 'images/mountains.jpg'
    const storageRef = fbRef(storage, 'tinyMCE/' + filename);

    resolve(uploadBytes(storageRef, blobInfo.blob(), metadata)
      .then((snapshot) => {
        console.log(blobInfo.blob())
        return getDownloadURL(snapshot.ref)
      })
    )
  })
}


const tinyMCEAPIKey = import.meta.env.VITE_TINY_MCE_API_KEY

const tinyMCEOptions = {
  language: "de",
  skin: theme.global.name.value.includes('dark') ? "oxide-dark" : "oxide",
  content_css: theme.global.name.value.includes('dark') ? "dark" : 'light',
  plugins: "advlist link image lists fullscreen media table",
  menubar: 'edit view insert format',
  toolbar: [ 'undo redo | link image media', 'bold italic underline strikethrough subscript superscript | alignleft aligncenter alignright alignjustify' ],
  paste_data_images: false,
  images_upload_handler: tiny_media_upload_handler,
}

</script>
