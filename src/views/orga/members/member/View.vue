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
            :mNr="member?.MNR"
            size="default"
            class="mx-2"
          ></MNrLabel>
          <Avatar
            v-if="showAvatar"
            :userID="member?.uid"
            :size="32"
            :tooltip="true"
            tooltipPrepend="User: "
            tooltipLocation="bottom"
            class="mx-2"
          />
        </PageTitle>

        <v-row
          v-if="!loading"
          justify="start"
          class="mx-0 pt-0 px-3 pb-3"
        >
          <v-btn
            color="primary"
            :to="{ name: 'Mitglied bearbeiten', params: { id: member?.id } }"
            prependIcon="mdi-pencil"
            class="mr-4 mb-4 text-none"
          >
            Bearbeiten
          </v-btn>
          <!--
          <NewContactDialog
            :memberName="`${member['FIRST_NAME']} ${member['LAST_NAME']}`"
            :memberID="member?.uid"
          />-->
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
          class="mx-0 mt-0 mb-0"
          style="padding-left: -20px;"
        >
          <v-col cols="12" lg="4" md="6" justify="start">
            <v-card elevation="0" class="w-100 pa-3 mb-6">
              <v-card-text class="mb-6 pa-0">
                <v-card-title class="text-h5 text--primary mb-5 pr-2">
                  <v-row class="mx-0 mt-0 pb-2">
                    Allgemein
                    <v-spacer></v-spacer>
                    <DialogAllgemeinEdit :id="route.params.id" :callbackFn="reloadMember" />
                  </v-row>
                </v-card-title>
                <v-row v-for="(field, k) in generalfields" :key="`${k}-${field.field}`">
                  <v-col cols="5" class="py-1 pr-0">
                    <v-card-text class="text-body-1 font-weight-bold py-0">
                      {{ field.name }}:
                    </v-card-text>
                  </v-col>
                  <v-col cols="7" class="py-1 pl-0">
                    <v-card-text class="text-body-1 py-0" v-html="parseField(field.type, member[field.id])">
                    </v-card-text>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            <v-card v-if="isAdminOrStaFue" elevation="0" class="w-100 pa-3">
              <v-card-text class="mb-6 pa-0">
                <v-card-title class="text-h5 text--primary mb-5">
                  <v-row class="mx-0 mt-0 pb-2">
                    Kontodaten
                    <v-spacer></v-spacer>
                    <DialogKontodatenEdit :id="route.params.id" :callbackFn="reloadMember" />
                  </v-row>
                </v-card-title>
                <v-row
                  v-for="(field, k) in bankfields"
                  :key="`${k}-${field.field}`"
                >
                  <v-col cols="5" class="py-1 pr-0">
                    <v-card-text class="text-body-1 font-weight-bold py-0">
                      {{ field.name }}:
                    </v-card-text>
                  </v-col>
                  <v-col cols="7" class="py-1 pl-0">
                    <v-card-text class="text-body-1 py-0">
                      {{ parseField(field.type, member[field.id]) }}
                    </v-card-text>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" lg="4" md="6" justify="start">
            <v-card elevation="0" class="w-100 pa-3 mb-6">
              <v-card-text class="mb-6 pa-0">
                <v-card-title class="text-h5 text--primary mb-5">
                  <v-row class="mx-0 mt-0 pb-2">
                    Gruppen
                    <v-spacer></v-spacer>
                    <DialogGruppenEdit
                      :memberID="route.params.id"
                      :callbackFn="reloadMember"
                      :groups="groups">
                    </DialogGruppenEdit>
                  </v-row>
                </v-card-title>
                <v-row
                  v-for="(group, k) in groups"
                  :key="`${k}-${group.id}`"
                  class="mx-4"
                >
                  <v-col cols="12" class="py-1 px-0">
                    <v-card
                      variant="tonal"
                      :class="`ml-${(10 - group.level) * 3}`"
                      :style="`border-left: 6px solid ${group.color}`"
                    >
                      <v-card-text class="px-4 text-body-1 py-1">
                        {{ group.name }}
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            <v-card elevation="0" class="w-100 pa-3">
              <v-card-text class="mb-6 pa-0">
                <v-card-title class="text-h5 text--primary mb-5">
                  <v-row class="mx-0 mt-0 pb-2">
                    Kontaktpersonen
                    <v-spacer></v-spacer>
                    <DialogContactNew
                      :memberID="route.params.id"
                      :callbackFn="reloadMember">
                    </DialogContactNew>
                  </v-row>
                </v-card-title>
                <v-row
                  v-for="(contact, k) in member['CONTACTS']"
                  :key="`member-${k}`"
                  class="mx-4"
                >
                  <v-col cols="12" class="py-1 px-0">
                    <ContactCard :member="member" :contact="contact" />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" lg="4" md="6" justify="start">
            <v-card width="100%" elevation="0" class="pa-3">
              <v-card-text class="mb-6 pa-0">
                <v-card-title class="text-h5 text--primary mb-5">
                  Foto & Mitgliedschaft
                </v-card-title>
                <v-row class="mx-4 mb-0">
                  <MemberAvatar :memberID="member.id" />
                </v-row>
                <v-row class="mt-4 mr-2">
                  <v-col cols="4" class="py-1 pr-0">
                    <v-card-text class="text-body-1 font-weight-bold py-0">
                      Beitritt:
                    </v-card-text>
                  </v-col>
                  <v-col class="py-1 px-0">
                    <v-card-text class="text-body-1 py-0">
                      {{ parseField('date', member['membership_start']) }}
                    </v-card-text>
                  </v-col>
                  <v-col cols="auto" class="py-1 pl-0">
                    <v-icon size="20">mdi-file</v-icon>
                  </v-col>
                </v-row>
                <v-row v-if="!!member['membership_end']" class="mr-2">
                  <v-col cols="4" class="py-1 pr-0">
                    <v-card-text class="text-body-1 font-weight-bold py-0">
                      Austritt:
                    </v-card-text>
                  </v-col>
                  <v-col class="py-1 px-0">
                    <v-card-text class="text-body-1 py-0">
                      {{ parseField('date', member['membership_start']) }}
                    </v-card-text>
                  </v-col>
                  <v-col cols="auto" class="py-1 pl-0">
                    <v-icon size="20">mdi-file</v-icon>
                  </v-col>
                </v-row>
                <v-row v-if="!!member['membership_end']" class="mr-2">
                  <v-col cols="4" class="py-1 pr-0">
                    <v-card-text class="text-body-1 font-weight-bold py-0">
                      Notizen:
                    </v-card-text>
                  </v-col>
                  <v-col class="py-1 px-0">
                    <v-card-text class="text-body-1 py-0">
                      {{ parseField('date', member['membership_start']) }}
                    </v-card-text>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
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
                  v-for="(field, k) in fieldsStore.getAllByCategoryID(category.id)"
                  :key="`${k}-${field.field}`"
                >
                  <v-col cols="5" class="py-1 pr-0">
                    <v-card-text class="text-body-1 font-weight-bold py-0">
                      {{ field.name }}:
                    </v-card-text>
                  </v-col>
                  <v-col cols="7" class="py-1 pl-0">
                    <v-card-text class="text-body-1 py-0">
                      {{ parseField(field.type, member[field.id]) }}
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
          <p>erstellt von <b>{{ usersStore.getByID(member?.createdUserID)?.name }}</b> am {{ fdate(member?.createdTimestamp) }}</p>
          <p v-if="member?.updatedTimestamp != null">
            zuletzt bearbeitet von <b>{{ usersStore.getByID(member?.updatedUserID)?.name }}</b> am {{ fdate(member?.updatedTimestamp) }}
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

import { useAuthStore } from '@/store/auth'
import { useUsersStore } from '@/store/users'
import { useMembersStore } from '@/store/members'
import { useCategoriesStore } from '@/store/categories'
import { useFieldsStore } from '@/store/fields'
import { useGroupsStore } from '@/store/groups'
import { useGroupMembershipsStore } from '@/store/group_memberships'

import { parseField } from '@/plugins/sms-helper'

import PageTitle from '@/components/PageTitle.vue'
import Avatar from '@/components/Avatar.vue'
import MNrLabel from '@/components/orga/members/MNrLabel.vue'
// import NewContactDialog from '@/components/NewContactDialog.vue'
import DialogAllgemeinEdit from '@/components/orga/members/DialogAllgemeinEdit.vue'
import DialogKontodatenEdit from '@/components/orga/members/DialogKontodatenEdit.vue'
import DialogGruppenEdit from '@/components/orga/members/DialogGruppenEdit.vue'
import MemberAvatar from '@/components/orga/members/MemberAvatar.vue'
import DialogContactNew from '@/components/orga/members/DialogContactNew.vue'
import ContactCard from '@/components/orga/members/ContactCard.vue'

const route = useRoute()

const authStore = useAuthStore()
const usersStore = useUsersStore()
const membersStore = useMembersStore()
const categoriesStore = useCategoriesStore()
const fieldsStore = useFieldsStore()
const groupsStore = useGroupsStore()
const groupMembershipsStore = useGroupMembershipsStore()

const loading = ref(true)

const member = ref({dummy: ''})

const generalfields = [
  {id: 'FIRST_NAME', field: 'FIRST_NAME', name: 'Vorname', type: 'text'},
  {id: 'LAST_NAME', field: 'LAST_NAME', name: 'Nachname', type: 'text'},
  {id: 'NICKNAME', field: 'NICKNAME', name: 'Fahrtenname', type: 'text'},
  {id: 'ADDRESS', field: 'ADDRESS', name: 'Adresse', type: 'text'},
  {id: 'ZIP', field: 'ZIP', name: 'PLZ', type: 'text'},
  {id: 'CITY', field: 'CITY', name: 'Ort', type: 'text'},
  {id: 'COUNTRY', field: 'COUNTRY', name: 'Land', type: 'text'},
  {id: 'NATIONALITY', field: 'NATIONALITY', name: 'Nationalität', type: 'text'},
  {id: 'BIRTHDAY', field: 'BIRTHDAY', name: 'Geburtstag', type: 'date'},
  {id: 'BIRTHPLACE', field: 'BIRTHPLACE', name: 'Geburtsort', type: 'text'},
  {id: 'PHONE', field: 'PHONE', name: 'Telefon', type: 'tel'},
  {id: 'MOBILE', field: 'MOBILE', name: 'Mobil', type: 'tel'},
  {id: 'EMAIL', field: 'EMAIL', name: 'E-Mail', type: 'email'}
]

const bankfields = [
  {id: 'IBAN', field: 'IBAN', name: 'IBAN', type: 'text'},
  {id: 'BIC', field: 'BIC', name: 'BIC', type: 'text'},
  {id: 'MANDATE_REF', field: 'MANDATE_REF', name: 'Mandatsreferenz', type: 'text'},
  {id: 'MANDATE_DATE', field: 'MANDATE_DATE', name: 'Mandats-Datum', type: 'date'}
]

onMounted(async () => {
  const id = route.params.id
  if (membersStore.getByID(id) === undefined) {
    await membersStore.fetchMember(id)
  }
  member.value = membersStore.getByID(id)
  loading.value = false
})

const goToSettings = () => {
  toast.info('E-Mail-Einstellungen noch nicht implementiert.')
}

const showAvatar = computed(() => {
  return member.value?.uid != null && member.value?.uid.length > 0
})

const groups = computed(() => {
  const groupMemberships = groupMembershipsStore.getByMemberID(route.params.id)
  return groupMemberships.map((groupMembership) => {
    return groupsStore.getByID(groupMembership.groupID)
  }).sort((a, b) => a.ord - b.ord)
})

const fdate = (date) => {
  if(date === null || date === undefined) return ''
  return format(date.toDate(), 'dd.MM.yyyy, HH:mm', {locale: de})
}

const reloadMember = async () => {
  member.value = membersStore.getByID(route.params.id)
}

const isAdminOrStaFue = computed(() => {
  return authStore.isAdmin || authStore.isStaFue
})
</script>
