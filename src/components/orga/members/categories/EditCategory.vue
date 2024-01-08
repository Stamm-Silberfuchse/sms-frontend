<template>
  <v-card class="pa-0">
    <v-card-text class="mb-6 pa-3">
      <v-card-title class="text-h5 text--primary mb-5 pr-1">
        <v-row class="mx-0 mt-0 pb-2">
          <v-icon size="20" class="handleCategory ml-0 pr-5 pt-3">
            mdi-drag-horizontal-variant
          </v-icon>
          {{ element.name }}
          <v-spacer></v-spacer>
          <DialogCategoryFieldNew
            :categoryID="element.id"
            :categoryName="element.name"
            :callbackFn="addFieldLocal"
          />
          <DialogCategoryEdit
            :id="element.id"
            :name="element.name"
            :callbackFn="editCategoryLocal"
          />
          <v-btn
            icon
            size="x-small"
            variant="flat"
            @click="deleteCategory(element.id)"
          >
            <v-icon size="x-large">
              mdi-delete
            </v-icon>
          </v-btn>
        </v-row>
      </v-card-title>
      <EditFields :categoryID="element.id" ref="notifyNewFieldRef" />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { useConfirm } from 'vuetify-use-dialog'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useCategoriesStore } from '@/store/categories'

import DialogCategoryEdit from '@/components/orga/members/categories/DialogCategoryEdit.vue'
import DialogCategoryFieldNew from '@/components/orga/members/categories/DialogCategoryFieldNew.vue'
import EditFields from '@/components/orga/members/categories/EditFields.vue'

const createConfirm = useConfirm()

const categoriesStore = useCategoriesStore()


</script>
