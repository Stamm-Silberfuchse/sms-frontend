<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
        <PageTitle
          :back="{ name: 'Mitglieder' }"
          :title="`${member['FIRST_NAME']} ${member['LAST_NAME']}`"
          :loading="loading"
        >
          <MNrLabel
            v-if="member?.MNR != null"
            :mNr="member.MNR"
            size="default"
            class="mx-2"
          ></MNrLabel>
          <Avatar
            v-if="showAvatar"
            :memberID="member.uuid"
            :size="32"
            tooltipLocation="bottom"
          />
          <v-chip
            class="ma-2"
            variant="flat"
            text-color="white"
          >
            inaktiv
          </v-chip>
          <v-chip
            class="ma-2"
            variant="flat"
            color="orange"
          >
            Meute
          </v-chip>
          <v-chip
            class="ma-2"
            variant="flat"
            color="blue-darken-4"
          >
            Sippe
          </v-chip>
          <v-chip
            class="ma-2"
            variant="flat"
            color="red-darken-4"
          >
            Rover
          </v-chip>
          <v-chip
            class="ma-2"
            variant="flat"
            color="yellow-darken-4"
            prependIcon="mdi-crown"
          >
            StaFü
          </v-chip>
        </PageTitle>

        <v-row justify="start" class="mx-0 pt-0 px-3 pb-3">
          <v-btn
            color="primary"
            :to="{ name: 'Mitglied bearbeiten', params: { id: member?.uuid } }"
            prependIcon="mdi-pencil"
            class="mr-4 mb-4 text-none"
          >
            Bearbeiten
          </v-btn>
          <NewContactDialog
            :memberName="`${member['FIRST_NAME']} ${member['LAST_NAME']}`"
            :memberID="member?.uuid"
          />
          <v-btn
            @click="goToSettings"
            prependIcon="mdi-email-edit-outline"
            class="mr-4 mb-4 text-none"
          >
            E-Mail-Einstellungen
          </v-btn>
        </v-row>

        <v-row
          v-if="!loading"
          justify="start"
          class="mx-0 mt-0 mb-4"
          style="padding-left: -20px;"
        >
          <v-col cols="12" lg="4" md="6" justify="start" v-for="(category, i) in categoriesStore.getAllSorted">
            <v-card width="100%" elevation="0" class="pa-3">
              <v-card-text class="mb-6 pa-0">
                <v-card-title class="text-h5 text--primary mb-5">
                  {{ category.name }}
                </v-card-title>
                <v-row
                  v-for="(field, k) in category.fields"
                  :key="`${k}-${field.field}`"
                >
                  <v-col cols="5" class="py-1 pr-0">
                    <v-card-text class="text-body-1 font-weight-bold py-0">
                      {{ field.name }}:
                    </v-card-text>
                  </v-col>
                  <v-col cols="7" class="py-1 pl-0">
                    <v-card-text class="text-body-1 py-0">
                      {{ parseField(field.type, member[field.field]) }}
                    </v-card-text>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <div v-if="!loading" class="bottom-info mt-6">
        <div class="text-center font-weight-light" style="font-size: 14px;">
          <p>erstellt von <b>{{ usersStore.getByID(member?.createdUserID)?.displayName }}</b> am {{ fdate(member?.createdTimestamp) }}</p>
          <p v-if="member?.updatedTimestamp != null">
            zuletzt bearbeitet von <b>{{ usersStore.getByID(member?.updatedUserID)?.displayName }}</b> am {{ fdate(member?.updatedTimestamp) }}
          </p>
        </div>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import format from 'date-fns/format'
import de from 'date-fns/locale/de'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useUsersStore } from '@/store/users'
import { useMembersStore } from '@/store/members'
import { useCategoriesStore } from '@/store/categories'

import { parseField } from '@/plugins/sms-helper'

import PageTitle from '@/components/PageTitle.vue'
import Avatar from '@/components/Avatar.vue'
import MNrLabel from '@/components/orga/members/MNrLabel.vue'
// import NewContactDialog from '@/components/NewContactDialog.vue'

const route = useRoute()

const usersStore = useUsersStore()
const membersStore = useMembersStore()
const categoriesStore = useCategoriesStore()

const loading = ref(true)

const member = ref({id: ''})

onMounted(async () => {
  const id = route.params.id
  if (membersStore.getByID(id) === undefined) {
    await membersStore.fetchMember(id)
  }
  member.value = membersStore.getByID(id)
  loading.value = false
})

const getMemberDataByFieldID = (field) => {
  if(loading.value) return '...'
  const value = memberData?.value?.find(el => el?.member_field_id === field.id)?.value
  return parseField(field.type, value)
}

const goToSettings = () => {
  toast.info('E-Mail-Einstellungen noch nicht implementiert.')
}

const showAvatar = computed(() => {
  return member.value?.uuid != null && member.value?.uuid.length > 0
})

const fdate = (date) => {
  if(date === null || date === undefined) return ''
  return format(date.toDate(), 'dd.MM.yyyy, HH:mm', {locale: de})
}
</script>
