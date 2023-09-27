<template>
  <v-dialog
    v-model="showDialog"
    width="300"
  >
  <v-card>
    <v-form>
      <v-card-title>
        Neues Mitglied
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="name"
          label="Vorname"
          required
        ></v-text-field>
        <v-text-field
          v-model="surname"
          label="Nachname"
          required
        ></v-text-field>
        <v-text-field
          v-model="begin"
          label="Beitrittsdatum"
          required
        ></v-text-field>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn variant="text" class="text-none" @click="showDialog = false">
          Abbrechen
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="elevated"
          class="text-none"
          @click="createMember"
        >
          Anlegen
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { supabase, getUser } from '@/plugins/supabase'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const router = useRouter()

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const name = ref('')
const surname = ref('')
const begin = ref('')

const showDialog  = computed({
  get() {
    return props.modelValue
  },
  set(showDialog) {
    emit('update:modelValue', showDialog )
  }
})

const createMember = async () => {
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
        emit('update:modelValue', false )
        toast.success("Mitglied angelegt.")
        router.push({ name: 'Mitglied bearbeiten', params: { id: member_id }})
      }
    })
    .catch((error) => {
      console.log(error)
      toast.error(error.message)
    })
}

</script>
