<template>
  <v-dialog v-if="!user?.disabled" v-model="showDialog" width="400">
    <template v-slot:activator>
      <v-tooltip location="start" text="User bearbeiten">
        <template v-slot:activator="{ props: tooltipProps }">
          <v-icon
            ref="activatorRef"
            v-bind="tooltipProps"
            color="primary"
            class="me-2"
            @click="showDialog = true"
          >
            mdi-pencil
          </v-icon>
        </template>
      </v-tooltip>
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-form
          ref="form"
          v-model="valid"
          :loading="loading"
          lazy-validation
          @submit.prevent
        >
          <v-card-title>
            User bearbeiten
          </v-card-title>
          <v-card-subtitle>
            Userdaten von '{{ user.name }}'
          </v-card-subtitle>
          <v-card-text>
            <v-text-field
              v-model="name"
              label="Name"
              required
              type="text"
              :rules="nameRules"
              class="py-2"
              @update:modelValue="updatedValues['name'] = name"
            ></v-text-field>
            <v-text-field
              v-model="email"
              label="E-Mail"
              required
              type="email"
              :rules="emailRules"
              class="pb-2"
              @update:modelValue="updatedValues['email'] = email"
            ></v-text-field>
            <v-select
              v-model="role"
              label="Rolle"
              required
              :items="roles"
              item-title="text"
              item-value="value"
              class="pb-2"
              @update:modelValue="updatedValues['role'] = role"
            ></v-select>
            <v-autocomplete
              v-model="members"
              label="verwaltete Mitglieder"
              :items="membersStore?.getAll"
              multiple
              chips
              closable-chips
              item-value="id"
              class="pb-2"
              @update:modelValue="updatedValues['members'] = members"
            >
              <template v-slot:chip="{ props, item }">
                <v-chip v-bind="props">
                  <template v-slot:prepend>
                    <v-avatar v-if="item.raw.PHOTO_URL?.length > 0" start>
                      <v-img :src="item.raw.PHOTO_URL" />
                    </v-avatar>
                    <v-avatar v-else color="primary" start>
                      <p style="font-size: 8px;">
                        {{ item.raw.FIRST_NAME[0] }}{{ item.raw.LAST_NAME[0] }}
                      </p>
                    </v-avatar>
                  </template>
                  {{ item.raw.NAME }}
                </v-chip>
              </template>

              <template v-slot:item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :prepend-avatar="item.raw.PHOTO_URL"
                  :title="item.raw.NAME"
                >
                  <template v-slot:prepend>
                    <v-avatar v-if="item.raw.PHOTO_URL?.length > 0" color="primary">
                      <v-img :src="item.raw.PHOTO_URL" />
                    </v-avatar>
                    <v-avatar v-else color="primary">
                      {{ item.raw.FIRST_NAME[0] }}{{ item.raw.LAST_NAME[0] }}
                    </v-avatar>
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>
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
              :disabled="loading || !valid"
              :loading="loading"
              color="primary"
              variant="elevated"
              class="text-none"
              type="submit"
              @click.prevent="onUpdateUser(isActive)"
            >
              Speichern
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
import { getAuth } from 'firebase/auth'
import { functions } from '@/plugins/firebase'
import { httpsCallable } from 'firebase/functions'
import { useConfirm } from 'vuetify-use-dialog'

import { useUsersStore } from '@/store/users'
import { useMembersStore } from '@/store/members'

const usersStore = useUsersStore()
const membersStore = useMembersStore()

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const createConfirm = useConfirm()

const showDialog = ref(false)

const loading = ref(false)

const name = ref('')
const email = ref('')
const role = ref('')
const members = ref([])

const updatedValues = ref({})

const form = ref(null)
const valid = ref(false)

const roles = ref([
  {
    text: 'Admin',
    value: 'admin',
  },
  {
    text: 'StaFü',
    value: 'stafue',
  },
  {
    text: 'Führung',
    value: 'fuehrung',
  },
  {
    text: 'Mitglied',
    value: 'mitglied',
  }
])

const nameRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte gib einen Namen an.'
  },
])
const emailRules = ref([
  value => {
    if (value?.length > 0) return true
    return 'Bitte gib eine E-Mail an.'
  },
  value => {
    const regex = /\S+@\S+\.\S+/
    if (regex.test(value)) return true
    return 'Bitte gib eine gültige E-Mail an.'
  },
])

const onUpdateUser = async (uid) => {
  const { valid } = await form.value?.validate()
  if (!valid) {
    toast.info('Bitte überprüfe deine Angaben.')
    loading.value = false
    return
  }

  const isConfirmed = await createConfirm({
    title: 'Userdaten aktualisieren?',
    content: 'Bist Du sicher?',
  })
  if (!isConfirmed) return

  loading.value = true
  const updateUser = httpsCallable(functions, 'updateUser')
  try {
    const payload = {
      name: name.value,
      email: email.value,
      role: role.value,
      members: members.value,
    }
    await updateUser({ uid: props.user?.id, payload: payload })
    toast.success(`Userdaten von '${usersStore.getByID(props.user?.id)?.name}' wurden gespeichert`)
    form.value?.reset()
  } catch (error) {
    toast.error(`Userdaten von '${usersStore.getByID(props.user?.id)?.name}' konnten nicht gespeichert werden.`)
  }
  showDialog.value = false
  loading.value = false
}

const onAbort = () => {
  showDialog.value = false
  loading.value = false
  form.value?.reset()
}

watch(() => showDialog.value, () => {
  if (showDialog.value) {
    name.value = props.user?.name
    email.value = props.user?.email
    role.value = props.user?.role
    members.value = props.user?.members
  }
})

</script>
