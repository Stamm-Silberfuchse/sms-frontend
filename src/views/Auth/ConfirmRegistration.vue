<template>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height mx-2">
      <div class="main-div pb-8">
        <v-img height="200" src="@/assets/logo_weiss.svg" />

        <h1 class="text-h2 font-weight-bold mt-10 text-white sms-title">SMS</h1>
        <v-card
          v-if="loading"
          class="mx-auto mt-10 pa-12 pb-8"
          elevation="8"
          max-width="448"
          rounded="lg"
          height="200"
        >
          <div class="pt-8">
            <v-progress-circular
              indeterminate
              color="primary">
            </v-progress-circular>
          </div>
        </v-card>
        <v-card
          v-if="!loading && (status === 'success')"
          class="mx-auto mt-10 pa-12 pb-8"
          elevation="8"
          max-width="448"
          rounded="lg"
          height="200"
        >
          <div class="px-0">
            <v-icon size="64" class="mb-4" color="green">
              mdi-check-circle-outline
            </v-icon>
            <h5 class="text-h5 font-weight-bold mb-4">
              E-Mail bestätigt!
            </h5>
          </div>
        </v-card>
        <v-alert
          v-if="!loading && (status === 'success')"
          icon="mdi-alert-circle-outline"
          type="info"
          class="mt-12 text-left mx-auto"
          max-width="448"
          color="white"
          border="start"
          border-color="info"
        >
          Dein Account muss nun von den Admins freigegeben werden.<br>
          Bitte habe ein bisschen Geduld.<br>
          Du bekommst eine E-Mail, sobald du auf das SMS zugreifen kannst.
        </v-alert>
        <v-alert
          v-if="!loading && (status === 'error')"
          icon="mdi-alert-circle-outline"
          type="error"
          class="mt-12 text-left mx-auto"
          max-width="448"
          color="white"
          border="start"
          border-color="primary"
        >
          {{ errortext }}
        </v-alert>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { toast } from 'vue3-toastify'
  import 'vue3-toastify/dist/index.css'

  const loading = ref(true)
  const status = ref(null)
  const errortext = ref('')

  onMounted(async () => {
    const { session } = await getSession()

    console.log(session)

    const { data, error } = await supabase.functions.invoke('on-email-confirmation', {
      headers: {},
      body: { uuid: session?.user?.id },
    })

    if (error instanceof FunctionsHttpError) {
      const errorMessage = await error.context.json()
      console.error('Function returned an error', errorMessage)
      toast.error(errorMessage.message)
      errortext.value = "Ein Fehler ist aufgetreten. Bitte kontaktiere einen Admin."
      status.value = 'error'
    } else if (error instanceof FunctionsRelayError) {
      console.log('Relay error:', error.message)
      toast.error(errorMessage.message)
      errortext.value = "Ein Fehler ist aufgetreten. Bitte kontaktiere einen Admin."
      status.value = 'error'
    } else if (error instanceof FunctionsFetchError) {
      console.log('Fetch error:', error.message)
      toast.error(errorMessage.message)
      errortext.value = "Ein Fehler ist aufgetreten. Bitte kontaktiere einen Admin."
      status.value = 'error'
    } else {
      status.value = 'success'
    }
    loading.value = false
    console.log(data)
  })
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Borel&family=Quicksand:wght@300;400;500;600;700&display=swap');

.sms-title {
  font-family: 'Quicksand', sans-serif !important;
}
</style>
