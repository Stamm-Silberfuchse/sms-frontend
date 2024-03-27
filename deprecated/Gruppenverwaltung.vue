<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
        <PageTitle title="Gruppenverwaltung" :back="{ name: 'Verwaltung' }">
          <v-col>
            <v-icon
            class="pb-1"
            icon="mdi-account-multiple"
            size="large"
            color="primary"
          />
          </v-col>
        </PageTitle>

        <!-- Buttons -->
        <v-row justify="start" class="mx-0 pt-0 px-3 pb-3">
          <DialogGroupNew :callbackFn="reloadGroups" />
        </v-row>

        <v-row class="mx-0 px-3">
          <v-card
            :loading="loading"
            variant="flat"
            class="w-100"
            :style="`border-left: 6px solid rgb(var(--v-theme-${tree[0]?.color}))`"
          >
            <v-card-text class="pa-3">
              <v-card-title class="text-h5 mb-3 pr-1">
                <v-row class="mx-0 mt-0 pb-2">
                  <v-col cols="auto" class="pa-0">
                    {{ tree[0]?.name }}
                    <v-card-subtitle class="px-0">
                      [...]
                    </v-card-subtitle>
                  </v-col>
                  <v-spacer></v-spacer>
                  <DialogGroupEdit
                    :id="tree[0]?.id"
                    :name="tree[0]?.name"
                    :callbackFn="onEditCategoryCallback"
                    class="mr-2 mt-2"
                  />
                  <v-btn
                    icon
                    size="x-small"
                    variant="flat"
                    @click="onDeleteCategoryCallback(element.id)"
                  >
                    <v-icon size="x-large">
                      mdi-delete
                    </v-icon>
                  </v-btn>
                </v-row>
              </v-card-title>
            </v-card-text>
          </v-card>
          <DraggableCard
            :subgroups="tree[0]?.subgroups"
            :resortedCallbackFn="onResortedGroups"
            :deletedCallbackFn="reloadGroups"
            class="w-100 mx-0"
          />
        </v-row>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useGroupsStore } from '@/store/groups'

import PageTitle from '@/components/PageTitle.vue'
import DialogGroupNew from '@/components/orga/groups/DialogGroupNew.vue'
import DialogGroupEdit from '@/components/orga/groups/DialogGroupEdit.vue'
import DraggableCard from "@/components/orga/groups/DraggableCard.vue"

const groupsStore = useGroupsStore()

const tree = ref([])

const maxLevels = 10

onMounted(() => {
  tree.value = groupsStore.getTree
})

const reloadGroups = async () => {
  await groupsStore.fetchAll()
  tree.value = groupsStore.getTree
}

const updateChildren = async (id, element, level, ord) => {
  const children = element.subgroups?.map((el) => el.id)
  const order = ord + 10*level
  await groupsStore.updateGroup(id, {
    children: children,
    level: maxLevels - level,
    order: order
  })
  let i = 0
  element.subgroups?.forEach((el) => {
    updateChildren(el.id, el, level+1, i)
    i++
  })
}

const onResortedGroups = async () => {
  await updateChildren(tree.value[0].id, tree.value[0], 0, 0)
  toast.success('Gruppenanordung gespeichert.')
}


</script>
