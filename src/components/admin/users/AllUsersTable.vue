<template>
  <v-data-table
    :headers="headers"
    :items="usersFiltered"
    :sort-by="[{ key: 'email', order: 'asc' }]"
    :search="search"
    :row-props="itemRowBackground"
    :loading="loading"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar flat class="px-2">
        <v-checkbox
          label="archivierte anzeigen"
          v-model="showAll"
          class="pt-5"
        ></v-checkbox>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          density="compact"
          label="Suche"
          single-line
          hide-details
        ></v-text-field>
      </v-toolbar>
    </template>

    <template v-slot:item.role="{ item }">
      <v-chip :color="getRoleColor(item)" variant="outlined">
        {{ roleName(item.role) }}
      </v-chip>
    </template>

    <template v-slot:item.emailVerified="{ value }">
      <v-icon>
        {{ value ? 'mdi-check' : 'mdi-close' }}
      </v-icon>
    </template>

    <template v-slot:item.members="{ value }">
      <div class="my-2">
        <template v-if="value?.length > 0">
          <v-row class="my-1">
            <v-chip :to="{ name: 'Mitglied ansehen', params: { id: value[0] } }">
              <template v-slot:prepend>
                <v-avatar start color="primary">
                  <v-img
                    v-if="membersStore?.getByID(value[0])?.PHOTO_URL?.length > 0"
                    :src="membersStore?.getByID(value[0])?.PHOTO_URL">
                  </v-img>
                  <p v-else style="font-size: 12px;">
                    {{ membersStore?.getByID(value[0])?.FIRST_NAME[0] }}{{ membersStore?.getByID(value[0])?.LAST_NAME[0] }}
                  </p>
                </v-avatar>
              </template>
              {{ membersStore?.getByID(value[0])?.NAME }}
            </v-chip>
            <v-menu
              v-if="value?.length > 1"
              location="bottom"
              open-on-hover
            >
              <template v-slot:activator="{ props }">
                <v-chip v-bind="props" class="ms-2">
                  +{{ value.length - 1 }}
                </v-chip>
              </template>

              <v-card class="pa-2 pr-0">
                <template v-for="member in value.slice(1)" :key="value">
                  <v-chip :to="{ name: 'Mitglied ansehen', params: { id: member } }" class="me-2">
                    <template v-slot:prepend>
                      <v-avatar start color="primary">
                        <v-img
                          v-if="membersStore?.getByID(member)?.PHOTO_URL?.length > 0"
                          :src="membersStore?.getByID(member)?.PHOTO_URL">
                        </v-img>
                        <p v-else style="font-size: 12px;">
                          {{ membersStore?.getByID(member)?.FIRST_NAME[0] }}{{ membersStore?.getByID(member)?.LAST_NAME[0] }}
                        </p>
                      </v-avatar>
                    </template>
                    {{ membersStore?.getByID(member)?.NAME }}
                  </v-chip>
                </template>
              </v-card>
            </v-menu>
          </v-row>
        </template>
      </div>
    </template>

    <template v-slot:item.actions="{ item }">
      <v-row class="flex-nowrap ma-0">
        <v-col cols="3" class="pa-0">
          <DialogUserEdit :user="item" />
        </v-col>

        <v-col cols="3" class="pa-0">
          <DialogUserPasswordEdit v-if="isAdmin" :user="item" />
        </v-col>

        <v-col cols="3" class="pa-0">
          <DialogUserPasswordEmail v-if="isAdmin" :user="item" />
        </v-col>

        <v-col cols="3" class="pa-0">
          <v-tooltip location="start" :text="item.disabled ? 'User aktivieren': 'User archivieren'">
            <template v-slot:activator="{ props }">
              <v-icon
                v-bind="props"
                color="primary"
                class="me-2"
                @click="onSetUserDisabled(item.id, !item.disabled)"
              >
                {{ item.disabled ? 'mdi-archive-off' : 'mdi-archive' }}
              </v-icon>
            </template>
          </v-tooltip>
        </v-col>
      </v-row>
    </template>
  </v-data-table>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { functions } from '@/plugins/firebase'
import { httpsCallable } from 'firebase/functions'
import { useConfirm } from 'vuetify-use-dialog'

import { useAuthStore } from '@/store/auth'
import { useUsersStore } from '@/store/users'
import { useMembersStore } from '@/store/members'

import DialogUserEdit from '@/components/admin/users/DialogUserEdit'
import DialogUserPasswordEdit from '@/components/admin/users/DialogUserPasswordEdit'
import DialogUserPasswordEmail from '@/components/admin/users/DialogUserPasswordEmail'

const createConfirm = useConfirm()

const authStore = useAuthStore()
const usersStore = useUsersStore()
const membersStore = useMembersStore()

const loading = ref(false)

const showAll = ref(false)
const search = ref('')

const headers = ref([
  {
    title: "Name",
    key: "name",
  },
  {
    title: "E-Mail",
    key: "email",
  },
  {
    title: "Rolle",
    key: "role",
  },
  {
    title: "Mitglied(er)",
    key: "members",
  },
  {
    title: "E-Mail bestätigt",
    key: "emailVerified",
  },
  {
    title: "",
    key: "actions",
    sortable: false,
    align: "end"
  }
])

const fetchMembers = async (all=false) => {
  loading.value = true
  await membersStore.fetchAll()
  loading.value = false
}

onMounted(async () => {
  // fetch Members
  await fetchMembers()
})

const users = computed(() => usersStore.getAllUsers)

const usersFiltered = computed(() => {
  return users.value.filter((el) => {
    return !(!showAll.value && el.disabled)
  })
})

const isAdmin = computed(() => {
  return authStore.isAdmin
})

const editItem = (item) => {
  console.log(item)
}

const onSetUserDisabled = async (uid, value) => {
  const isConfirmed = await createConfirm({
    title: `User '${usersStore.getByID(uid)?.name}' ${value ? 'archivieren' : 'aktivieren'}`,
    content: 'Bist Du sicher?',
  })
  if (!isConfirmed) return

  const updateUser = httpsCallable(functions, 'updateUser')
  try {
    const payload = {
      disabled: value,
    }
    await updateUser({ uid: uid, payload: payload })
    toast.success(`User '${usersStore.getByID(uid)?.name}' wurde ${value ? 'archiviert' : 'aktiviert'}.`)
  } catch (error) {
    toast.error(`User '${usersStore.getByID(uid)?.name}' konnte nicht ${value ? 'archiviert' : 'aktiviert'} werden.`)
  }
}

const roleName = (role) => {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'stafue':
      return 'StaFü'
    case 'fuehrung':
      return 'Führung'
    case 'mitglied':
      return 'Mitglied'
    default:
      return 'Unbekannt'
  }
}

const getRoleColor = (user) => {
  if (user?.disabled) return 'grey'
  switch (user?.role) {
    case 'admin':
      return 'contrast'
    case 'stafue':
      return 'red'
    case 'fuehrung':
      return 'blue'
    case 'mitglied':
      return 'orange'
    default:
      return 'grey'
  }
}

const itemRowBackground = (row) => {
  return { class: row.item.disabled ? 'disabled-row' : 'test' }
}
</script>

<style>
.disabled-row {
  background-color: rgb(var(--v-theme-darker)) !important;
  opacity: 0.7 !important;
}
</style>
