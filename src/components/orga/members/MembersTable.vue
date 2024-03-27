<template>
  <v-data-table
    v-model="selected"
    :headers="memberList"
    :items="membersFiltered"
    :search="search"
    item-value="id"
    return-object
    show-select
    class="elevation-1"
    v-model:sort-by="sortBy"
    :loading="loading"
  >

    <template v-slot:top>
      <v-toolbar class="px-4">
        <!--
        <v-chip
          variant="flat"
          :color="meute ? 'orange' : 'orange-lighten-4'"
          class="mr-2"
          @click="meute = !meute"
        >
          Meute
        </v-chip>
        <v-chip
          variant="flat"
          :color="sippe ? 'blue-darken-4' : 'blue-lighten-4'"
          class="mr-2"
          @click="sippe = !sippe"
        >
          Sippe
        </v-chip>
        <v-chip
          variant="flat"
          :color="rover ? 'red-darken-4' : 'red-lighten-4'"
          class="mr-2"
          @click="rover = !rover"
        >
          Rover
        </v-chip>
        -->
        <v-checkbox
          label="alle anzeigen"
          v-model="showAll"
          class="pt-5"
        ></v-checkbox>
        <v-spacer />
        <v-select
          v-model="memberListChoice"
          :items="memberListsOptions"
          label="Liste"
          density="compact"
          hide-details
          item-title="name"
          return-object="true"
          @update:model-value="setMemberList($event)"
        >
        </v-select>
        <v-spacer />
        <v-text-field
          v-model="search"
          density="compact"
          label="Suche"
          single-line
          hide-details
        ></v-text-field>
      </v-toolbar>
    </template>

    <template v-slot:item.MNR="{ item }">
      <MNrLabel :mNr="item.MNR" />
    </template>

    <template v-slot:item.FIRST_NAME="{ item }">
      <router-link
        style="text-decoration: none;"
        class="text-primary"
        tag="a"
        :to="{ name: 'Mitglied ansehen', params: { id: item.id } }"
      >
        {{ item.FIRST_NAME }}
      </router-link>
    </template>

    <template v-slot:item.LAST_NAME="{ item }">
      <router-link
        style="text-decoration: none;"
        class="text-primary"
        tag="a"
        :to="{ name: 'Mitglied ansehen', params: { id: item.id } }"
      >
        {{ item.LAST_NAME }}
      </router-link>
    </template>

    <template v-slot:item.GENDER="{ item }">
      <v-icon>
        {{ getGenderIcon(item.raw.GENDER) }}
      </v-icon>
    </template>

    <template v-slot:item.actions="{ item }">
      <v-icon
        size="small"
        class="me-2"
        @click="console.log(item); editMember(item.raw?.id)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        size="small"
        class="me-2"
        @click="archiveMember(item.raw?.id)"
      >
        mdi-delete
      </v-icon>
    </template>

    <template v-slot:no-data>
        Keine Daten vorhanden
    </template>
  </v-data-table>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useMembersStore } from '@/store/members'
import { useMemberListsStore } from '@/store/member_lists'

import MNrLabel from '@/components/orga/members/MNrLabel.vue'

const $router = useRouter()

const membersStore = useMembersStore()
const memberListsStore = useMemberListsStore()

const loading = ref(true)

const memberListChoice = ref(null)

const memberList = ref([
  { title: 'M-Nr.', key: 'MNR' },
  { title: 'Nachname', key: 'LAST_NAME' },
  { title: 'Vorname', key: 'FIRST_NAME' },
  { title: 'Aktionen', value: 'actions', sortable: false, align: 'end' },
])

const selected = ref([])
const sortBy = ref([{ key: 'LAST_NAME', order: 'asc' }])

const memberListsOptions = ref([])

const members = ref([])

const meute = ref(false)
const sippe = ref(false)
const rover = ref(false)

const search = ref('')
const showAll = ref(false)
const loadedAll = ref(false)

const fetchMembers = async (all=false) => {
  loading.value = true
  //TODO: const query_eq = all ? '' : 'archived'
  await membersStore.fetchAll()
  members.value = membersStore.getAll
  loading.value = false
}

onMounted(async () => {
  // fetch Members
  await fetchMembers()
  // fetch MemberLists
  memberListsOptions.value = memberListsStore.getAll
  memberListChoice.value = memberListsOptions.value[0]
  setMemberList({ items: memberListChoice.value?.items })
})

const getGenderIcon = (value) => {
  switch(value) {
    case "M": return 'mdi-gender-male'
    case "W": return 'mdi-gender-female'
    case "D": return 'mdi-gender-non-binary'
    default: return 'mdi-minus'
  }
}

const editMember = (id) => {
  $router.push('/members/member/' + id + '/edit')
}

const archiveMember = (id) => {
  toast.error("Archivieren noch nicht implementiert.")
}

const membersFiltered = computed(() => {
  return members.value.filter((el) => {
    if(!showAll.value && el.archived) return false
    return true
  })
})

watch(showAll, (value) => {
  if(showAll && !loadedAll.value) {
    fetchMembers(true)
    loadedAll.value = true
  }
})

const setMemberList = (event) => {
  memberList.value = [...event.items, { title: 'Aktionen', value: 'actions', sortable: false, align: 'end' }]
}

</script>
