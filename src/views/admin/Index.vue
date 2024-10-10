<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
        <PageTitle title="Administration" />

        <v-row
          justify="start"
          class="mx-0 mt-4 mb-2"
        >
          <v-col cols="12" class="py-0">
            <v-card class="mb-4 px-3">
              <v-card-text class="mb-4">
                <v-card-title class="text-h5 text--primary mb-3 px-0">
                  Userverwaltung
                </v-card-title>

                <v-row>
                  <v-col cols="12" md="6" lg="4">
                    <UsersCard />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row
          justify="start"
          class="mx-0 mt-0 mb-2"
        >
          <v-col cols="12" class="py-0">
            <v-card class="mb-4 px-3">
              <v-card-text class="mb-4">
                <v-card-title class="text-h5 text--primary mb-3 px-0">
                  E-Mails
                </v-card-title>

                <v-row>
                  <v-col cols="12" md="6" lg="4">
                    <v-card
                      class="mx-auto"
                      color="warning"
                      :variant="mailsToConfirm?.length > 0 ? 'flat' : 'tonal'"
                    >
                      <v-card-item class="pb-0">
                        <div>
                          <div class="text-overline mb-3">
                            Freigaben ausstehend
                          </div>
                          <div class="text-center text-h3 font-quicksand font-weight-bold">
                            {{ mailsToConfirm?.length }}
                          </div>
                        </div>
                      </v-card-item>

                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                          :icon="showEmailsToConfirm ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                          @click="showEmailsToConfirm = !showEmailsToConfirm"
                        ></v-btn>
                      </v-card-actions>

                      <v-expand-transition>
                        <div v-show="showEmailsToConfirm">
                          <template v-for="(email, idx) in mailsToConfirm" :key="email.id">
                            <v-divider></v-divider>
                            <v-card
                              :rounded="0"
                              variant="flat"
                              color="transparent"
                              :to="{ name: 'MailFreigabe', params: { id: email.id } }"
                              class="w-100"
                            >
                              <v-row justify="start" class="mx-3 my-2">
                                <v-col cols="auto" class="px-1">
                                  <Avatar :userID="email.createdUserID" :tooltip="true" tooltip-prepend="erstellt von:" />
                                </v-col>
                                <v-col align-self="center">
                                  <v-card-item
                                    :title="email.subject"
                                    class="pa-0 mail-title"
                                  >
                                    <v-card-subtitle class="pb-0">
                                      <span>
                                        {{ fdate(email.createdTimestamp) }}
                                      </span>
                                    </v-card-subtitle>
                                    <v-chip
                                      v-if="email.uploadedFiles?.length > 0"
                                      label
                                      density="compact"
                                      prepend-icon="mdi-paperclip"
                                      class="mt-2"
                                    >
                                      {{ email.uploadedFiles?.length }} Anhänge
                                    </v-chip>
                                  </v-card-item>
                                </v-col>
                              </v-row>
                            </v-card>
                          </template>
                        </div>
                      </v-expand-transition>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

import { useUsersStore } from '@/store/users'
import { useMailsStore } from '@/store/mails'

import PageTitle from '@/components/PageTitle.vue'
import Avatar from '@/components/Avatar.vue'
import UsersCard from '@/components/admin/UsersCard.vue'

const router = useRouter()

const usersStore = useUsersStore()
const mailsStore = useMailsStore()

const showEmailsToConfirm = ref(false)

const mailsToConfirm = computed(() => {
  return mailsStore.getAllByStatus('pending')
})

onMounted(() => {
  mailsStore.fetchAll()
})

const fdate = (date) => {
  if(!!date) {
    return format(date.toDate(), 'dd.MM.yyyy, HH:mm', {locale: de})
  }
  return ''
}

</script>
