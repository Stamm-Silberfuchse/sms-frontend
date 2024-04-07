<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
        <PageTitle title="Listenkonfiguration" :back="true" />

        <v-row
          justify="start"
          class="mx-0 pt-0 px-3 pb-3"
        >
          <DialogMemberListNew :onListCreatedCallbackFn="onListCreated" />
          <DialogMemberListDefaultSelect />
        </v-row>

        <v-row
          justify="start"
          class="mx-0 pt-0 px-3 pb-3"
        >
          <v-col class="pa-0">
            <v-select
              v-model="currentList"
              :items="lists"
              item-title="name"
              item-value="id"
              label="Liste"
              return-object
              hide-details
              bg-color="contrastInv"
              @update:model-value="onChangedList"
            />
          </v-col>
          <v-col cols="auto" align-self="center" class="pa-0 pl-4">
            <DialogListEdit :list="currentList" :onEditCallbackFn="onListEditCallback" />
          </v-col>
          <v-col cols="auto" align-self="center" class="pa-0 pl-4">
            <DialogListDelete :list="currentList" :onDeleteCallbackFn="onDeleteList" />
          </v-col>
        </v-row>

        <v-row
          justify="start"
          class="mx-0 pt-0 px-3 pb-3"
        >
          Ordne in der folgenden Tabelle beliebig vielen Spalten entsprechende Profilfelder zu.
          Zusätzlich kannst du die Standardsortierung vorgeben und Bedingungen zu Feldern hinzufügen,
          nach denen die jeweiligen Mitglieder gefiltert werden sollen.
        </v-row>

        <v-row
          justify="center"
          class="mx-0 pt-0 px-3"
        >
          <v-col cols="12" md="6" class="px-0 pb-0">
            <draggable
              tag="div"
              v-model="columns"
              handle=".handler-list"
              item-key="title"
              class="mx-0 mt-0 mb-4 list-group"
            >
              <template #item="{ element, index }">
                <DraggableListElement
                  :element="element"
                  :index="index"
                  :deletedCallbackFn="onDeleteColumn"
                  :changedCallbackFn="onChangedColumn"
                />
              </template>
            </draggable>
          </v-col>
        </v-row>

        <v-row
          justify="center"
          class="mx-0 pt-0 px-3 pb-3"
        >
          <v-col cols="12" md="6" class="px-0">
            <v-row justify="space-between" class="mx-0">
              <v-btn
                prependIcon="mdi-plus"
                class="mr-4 mb-4 text-none"
                @click="onAddColumn"
              >
                Spalte hinzufügen
              </v-btn>
              <v-btn
                color="primary"
                :loading="loading"
                prependIcon="mdi-content-save"
                class="ml-4 mb-4 text-none"
                @click="onSave"
              >
                Speichern
              </v-btn>
            </v-row>
          </v-col>
        </v-row>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { useConfirm } from 'vuetify-use-dialog'
import { v4 as uuidv4 } from 'uuid'

import { useMemberListsStore } from '@/store/member_lists'

import PageTitle from '@/components/PageTitle.vue'
import DialogMemberListNew from '@/components/orga/lists/DialogMemberListNew.vue'
import DraggableListElement from '@/components/orga/lists/DraggableListElement.vue'
import DialogListDelete from '@/components/orga/lists/DialogListDelete.vue'
import DialogListEdit from '@/components/orga/lists/DialogListEdit.vue'
import DialogMemberListDefaultSelect from '@/components/orga/lists/DialogMemberListDefaultSelect.vue'

const createConfirm = useConfirm()

const memberListsStore = useMemberListsStore()

const currentList = ref({ name: '-', items: [] })
const columns = ref([])
const loading = ref(false)

onMounted(() => {
  memberListsStore.fetchAll()
  currentList.value = memberListsStore.getAll[0]
  columns.value = currentList.value?.items || []
})

const lists = computed(() => memberListsStore.getAll)

const onListCreated = (listID) => {
  currentList.value = memberListsStore.getByID(listID)
  columns.value = currentList.value?.items
}

const onListEditCallback = (name) => {
  currentList.value.name = name
}

const onChangedList = () => {
  columns.value = []
  columns.value = currentList.value?.items
}

const onDeleteList = () => {
  currentList.value = memberListsStore.getAll[0]
  columns.value = currentList.value?.items

}

const onDeleteColumn = (column) => {
  const index = columns.value.indexOf(column)
  columns.value.splice(index, 1)
}

const onAddColumn = () => {
  columns.value.push({
    title: '',
    field: null,
    sort: null,
    filter: null,
    id: uuidv4()
  })
}

const onChangedColumn = (column, index) => {
  columns.value[index] = { key: column.field, title: column.name, id: column.id }
}

const onSave = async () => {
  if (columns.value.map((col) => col.key).includes(undefined)) {
    toast.error('Bitte gib für alle Spalten ein Feld an.')
    return
  }

  const isConfirmed = await createConfirm({
    title: 'Liste speichern',
    content: 'Bist Du sicher?',
  })
  if (!isConfirmed) return

  loading.value = true
  const payload = {
    items: columns.value
  }
  try {
    await memberListsStore.updateMemberList(currentList.value.id, payload)
    toast.success('Liste gespeichert')
  } catch (error) {
    toast.error('Fehler beim Speichern der Liste')
  } finally {
    loading.value = false
  }
}

</script>
