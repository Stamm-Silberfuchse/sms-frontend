<template>
  <v-card
    class="mx-auto"
    color="primary"
    :variant="usersStore.getAmountOfUsersRegistered > 0 ? 'flat' : 'tonal'"
  >
    <v-card-item class="pb-0">
      <div>
        <div class="text-overline mb-3">
          Ausstehende Anträge
        </div>
        <div class="text-center text-h3 font-Quicksand font-weight-bold">
          {{ usersStore.getAmountOfUsersRegistered }}
        </div>
      </div>
    </v-card-item>

    <v-card-actions>
      <v-btn class="text-none">
        Alle ansehen
      </v-btn>
      <v-spacer />
      <v-dialog width="500">
        <template v-if="usersStore.getAmountOfUsersRegistered > 0" v-slot:activator="{ props }">
          <v-btn v-bind="props" class="text-none">
            Prüfen
          </v-btn>
        </template>

        <template v-slot:default="{ isActive }">
          <v-card title="Neuen User bestätigen" :loading="loading">
            <template v-slot:loader="{ isActive }">
              <v-progress-linear
                :active="isActive"
                color="primary"
                indeterminate
              ></v-progress-linear>
            </template>

            <v-card-text>
              <v-list lines="three">
                <v-list-item
                  v-for="user in usersRegistered"
                  :key="user.id"
                  :title="user.full_name"
                  :subtitle="user.email"
                  class="px-0"
                >
                  <template v-slot:prepend>
                    <v-avatar color="primary">
                      <span class="font-quicksand font-bold">
                        {{ getInitials(user?.full_name) }}
                      </span>
                    </v-avatar>
                  </template>

                  <template v-slot:append>
                    <v-list-item-action class="ml-2">
                      <v-tooltip location="bottom">
                        <template v-slot:activator="{ props }">
                          <v-btn
                            icon
                            size="x-small"
                            variant="text"
                            v-bind="props"
                            @click="acceptUser(user.id, isActive)"
                            :disabled="loading"
                          >
                            <v-icon color="green" size="24">
                              mdi-check
                            </v-icon>
                          </v-btn>
                        </template>
                        <span>Bestätigen</span>
                      </v-tooltip>
                    </v-list-item-action>
                    <v-list-item-action>
                      <v-tooltip location="bottom">
                        <template v-slot:activator="{ props }">
                          <v-btn
                            icon
                            size="x-small"
                            variant="text"
                            v-bind="props"
                            @click="denyUser(user.id)"
                            :disabled="loading"
                          >
                            <v-icon color="red" size="24">
                              mdi-close
                            </v-icon>
                          </v-btn>
                        </template>
                        <span>Ablehnen</span>
                      </v-tooltip>
                    </v-list-item-action>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn
                text="Schließen"
                class="text-none"
                @click="isActive.value = false"
                :disabled="loading"
              ></v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>

    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUsersStore } from '@/store/users'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const usersStore = useUsersStore()

const loading = ref(false)

const usersRegistered = computed(() => {
  return usersStore.users.filter(user => user.status === 'registered')
})

const getInitials = (full_name) => {
  if(full_name == null) return ''
  return full_name.split(' ').map(n => n[0]).join('')
}

const acceptUser = async (uuid, isActive) => {
  loading.value = true
  const { data, error } = await supabase.functions.invoke('admin-set-user-status', {
    headers: {},
    body: { uuid: uuid, userStatus: 'verified' },
  })
  console.log(data, error)
  if (error) {
    console.error(error)
    toast.error("Ein Fehler ist aufgetreten. Bitte kontaktiere einen Admin.")
  } else {
    usersStore.updateUserStatus(uuid, 'verified')
    if(usersStore.getAmountOfUsersRegistered === 0) {
      isActive.value = false
    }
    toast.success("User erfolgreich bestätigt.")
  }
  loading.value = false
}
const denyUser = (uuid) => {
  loading.value = true
  setTimeout(() => {
    console.log("HEY")
    loading.value = false
  }, 1000)
}

</script>
