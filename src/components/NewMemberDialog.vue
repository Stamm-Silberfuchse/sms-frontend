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
        <v-btn variant="text" class="text-none">
          Abbrechen
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="text"
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase, getUser } from '@/plugins/supabase'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import moment from 'moment'

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
  console.log(((new Date()).toISOString()).toLocaleString('de-DE'))
  console.log(moment(begin.value, "DD-MM-YYYY").format("YYYY-MM-DD"))
  supabase
    .from('members')
    .insert([
      {
        usr_id_create: user.id,
        timestamp_create: ((new Date()).toISOString()).toLocaleString('de-DE'),
        begin: moment(begin.value, "DD-MM-YYYY").format("YYYY-MM-DD")
      },
    ])
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error

      if(data) {
        console.log(data)
        toast.success("Mitglied angelegt.")
        router.push('/members/member/' + data[0].id + '/edit')
      }
    })
    .catch((error) => {
      console.log(error)
      toast.error(error.message)
    })



}

</script>
