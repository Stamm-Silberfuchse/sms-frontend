<template>
  <v-dialog v-if="!user?.disabled" v-model="showDialog" width="400">
    <template v-slot:activator>
      <v-tooltip location="start" text="E-Mail zum Zurücksetzen des Passworts senden">
        <template v-slot:activator="{ props: tooltipProps }">
          <v-icon
            ref="activatorRef"
            v-bind="tooltipProps"
            color="primary"
            class="me-2"
            @click="showDialog = true"
          >
            mdi-email-lock
          </v-icon>
        </template>
      </v-tooltip>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-form
          ref="form"
          :loading="loading"
          @submit.prevent
        >
          <v-card-title>
            Passwort per E-Mail zurücksetzen
          </v-card-title>
          <v-card-text>
            <v-alert icon="mdi-alert" type="warning" variant="outlined">
              <strong>Wichtig:</strong> Der User erhält eine E-Mail mit einem Link zum Zurücksetzen des Passworts.
            </v-alert>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn
              variant="text"
              class="text-none"
              :disabled="loading"
              @click="onAbort(isActive)"
            >
              Abbrechen
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              :disabled="loading"
              :loading="loading"
              color="primary"
              variant="elevated"
              class="text-none"
              type="submit"
              @click.prevent="onSendMail"
            >
              Senden
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { functions } from '@/plugins/firebase'
import { httpsCallable } from 'firebase/functions'
import { useConfirm } from 'vuetify-use-dialog'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const createConfirm = useConfirm()

const showDialog = ref(false)

const loading = ref(false)

const form = ref(null)

const onSendMail = async () => {
  const isConfirmed = await createConfirm({
    title: 'E-Mail wirklich versenden?',
    content: 'Bist Du sicher?',
  })
  if (!isConfirmed) return

  loading.value = true
  const sendUserPasswordEmail = httpsCallable(functions, 'sendUserPasswordEmail')
  try {
    await sendUserPasswordEmail({ uid: props.user?.id, email: props.user?.email, name: props.user?.name })
    toast.success(`E-Mail wurde an '${props.user?.email}' gesendet.`)
    form.value?.reset()
  } catch (error) {
    toast.error(`E-Mail konnte nicht an '${props.user?.email}' gesendet werden.`)
  }
  showDialog.value = false
  loading.value = false
}

const onAbort = () => {
  showDialog.value = false
  loading.value = false
  form.value?.reset()
}
</script>
