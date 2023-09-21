<template>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height">
      <v-img height="200" src="@/assets/logo_weiss.svg" />

      <h1 class="text-h2 font-weight-bold mt-10 text-white font-quicksand">SMS</h1>

      <div v-if="formState === 'login'" style="height: 300px">
        <v-card
          class="mx-auto mt-10 pa-12 pb-8"
          elevation="8"
          max-width="448"
          rounded="lg"
        >
          <v-text-field
            v-model="email"
            density="compact"
            placeholder="E-Mail"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
            color="primary"
          ></v-text-field>

          <v-text-field
            v-model="password"
            :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
            :type="visible ? 'text' : 'password'"
            density="compact"
            placeholder="Passwort"
            prepend-inner-icon="mdi-lock-outline"
            variant="outlined"
            color="primary"
            @click:append-inner="visible = !visible"
          ></v-text-field>

          <v-btn
            block
            class="mb-3"
            color="primary"
            size="large"
            variant="tonal"
            @click="onSignIn"
          >
            Anmelden
          </v-btn>

          <v-row>
            <v-col class="d-flex align-center justify-end">
              <v-btn variant="text" class="text-primary text-none" x-small @click="formState='pw-reset'">
                Passwort vergessen?
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </div>

      <div v-else style="height: 300px">
        <v-card
          class="mx-auto mt-10 pa-12 pb-8"
          elevation="8"
          max-width="448"
          rounded="lg"
        >

          <v-text-field
            v-model="email"
            density="compact"
            placeholder="E-Mail"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
            color="primary"
          ></v-text-field>

          <v-btn
            block
            class="mb-3"
            color="primary"
            size="large"
            variant="tonal"
            @click="onResetPW"
          >
            Passwort zurücksetzen
          </v-btn>

          <v-row>
            <v-col class="d-flex align-center justify-start">
              <v-btn
                variant="text"
                class="text-primary text-none"
                x-small
                @click="formState='login'"
                prepend-icon="mdi-arrow-left"
              >
                Anmelden
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { supabase, signIn, resetPW } from '@/plugins/supabase'

  import { useUserStore } from '@/store/user'

  const router = useRouter()
  const route = useRoute()

  const user = useUserStore()

  const visible = ref(false)
  const formState = ref('login')

  const email = ref('johannesmichaelis0@gmail.com')
  const password = ref('joh_Test_1')

  const onSignIn = async () => {
    const data = await signIn(email.value, password.value)
    if (data != null) {
      router.push(route.query.redirect || '/')
    }
  }

  const onResetPW = () => {
    resetPW(email.value)
  }
</script>
