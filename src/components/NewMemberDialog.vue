<template>
  <v-dialog width="300">
    <template v-slot:activator="{ props }">
      <v-btn
        color="primary"
        v-bind="props"
        prependIcon="mdi-account-plus"
        class="mr-4 mb-4 text-none"
      >
        Anlegen
      </v-btn>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-form fast-fail ref="form">
          <v-card-title>
            Neues Mitglied
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="name"
              label="Vorname"
              required
              autofocus
              :rules="nameRules"
            ></v-text-field>
            <v-text-field
              v-model="surname"
              label="Nachname"
              required
              :rules="surnameRules"
            ></v-text-field>
            <v-text-field
              v-model="begin"
              label="Beitrittsdatum"
              required
              type="date"
              :rules="beginRules"
            ></v-text-field>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn
              variant="text"
              class="text-none"
              @click="isActive.value = false"
            >
              Abbrechen
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              :disabled="loading || !(name.length>0) || !(surname.length>0) || !(begin.length>0)"
              :loading="loading"
              color="primary"
              variant="elevated"
              class="text-none"
              type="submit"
              @click.prevent="createMember(isActive)"
            >
              Anlegen
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase, getUser } from '@/plugins/supabase'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const router = useRouter()

const loading = ref(false)

const name = ref('')
const surname = ref('')
const begin = ref('')

const form = ref(null)

const nameRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte gib einen Namen an.'
  },
])

const surnameRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte gib einen Nachnamen an.'
  },
])

const beginRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte gib ein Beitrittsdatum an.'
  },
])

const createMember = async () => {
  loading.value = true
  const { valid } = await form.value?.validate()
  if (!valid) {
    toast.info('Bitte überprüfe deine Angaben.')
    loading.value = false
    return
  }

  const user = await getUser()

  let member_id = null

  await supabase.from('members').insert([
      {
        usr_id_create: user.id,
        begin: (new Date(begin.value)).toISOString()
      },
    ])
    .select()
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        member_id = data[0].id
      }
    })
    .catch((error) => {
      console.log(error)
      toast.error(error.message)
    })

  await supabase.from('members_data').insert([
      {
        member_id: member_id,
        member_field_id: 1,
        value: surname.value
      },
      {
        member_id: member_id,
        member_field_id: 2,
        value: name.value
      },
    ])
    .then(({ error, status }) => {
      if (error && status !== 406) throw error
      if(status === 201) {
        toast.success("Mitglied angelegt.")
        router.push({ name: 'Mitglied bearbeiten', params: { id: member_id }})
      }
    })
    .catch((error) => {
      console.log(error)
      toast.error(error.message)
    })
  toast.success("Mitglied angelegt.")
  loading.value = false
}

</script>
