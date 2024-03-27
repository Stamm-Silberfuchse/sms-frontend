<template>
  <v-card class="pa-0">
    <v-card-text class="mb-6 pa-3">
      <v-card-title class="text-h5 text--primary mb-5 pr-1">
        <v-row class="mx-0 mt-0 pb-2">
          <v-icon size="20" class="cursor-move ml-0 pr-5 pt-3">
            mdi-drag-horizontal-variant
          </v-icon>
          {{ element.name }}
          <v-spacer></v-spacer>
          <DialogCategoryEdit
            :id="element.id"
            :name="element.name"
            :callbackFn="onEditCategoryCallback"
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
      <EditFields :categoryID="element.id" :updates="up" />
    </v-card-text>
  </v-card>
</template>

<script setup>
import DialogCategoryEdit from '@/components/orga/members/categories/DialogCategoryEdit.vue'
import EditFields from '@/components/orga/members/categories/EditFields.vue'

const props = defineProps({
  element: {
    type: Object,
    required: true
  },
  onEditCategoryCallback: {
    type: Function,
    default: () => {}
  },
  onDeleteCategoryCallback: {
    type: Function,
    default: () => {}
  }
})
</script>
