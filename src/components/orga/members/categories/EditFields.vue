<template>
  <div>
    <draggable
      v-if="!loading"
      tag="div"
      v-model="fields"
      :handle="`.handleFields-${props.categoryID}`"
      item-key="field"
      class="mx-0 mt-0 mb-4 list-group"
      @end="onResortedFields"
    >
      <template #item="{ element, index }">
        <v-row class="px-2">
          <v-col cols="1" class="py-1" align="center">
            <v-icon size="14" :class="`handleFields-${props.categoryID} cursor-move pt-5`">
              mdi-drag-horizontal-variant
            </v-icon>
          </v-col>
          <v-col cols="6" class="py-1 px-0">
            <v-text-field
              v-model="element.name"
              density="compact"
              label="Feldname"
              single-line
              hide-details
              class="px-0"
              @update:model-value="element.changed = true"
            >
              <template v-slot:append-inner>
                <v-btn v-if="element.changed && !element.loading" icon variant="text" size="x-small" class="post-lower-opacity" type="submit" @click="onSaveField(element)">
                  <v-icon size="x-large">mdi-content-save</v-icon>
                </v-btn>
                <v-progress-circular
                  v-else-if="element.loading"
                  indeterminate
                  size="20"
                  color="primary"
                />
              </template>
            </v-text-field>
          </v-col>
          <v-col cols="4" class="py-1 px-0">
            <v-select
              v-model="element.type"
              :items="possibleFieldTypes"
              item-value="id"
              item-title="name"
              density="compact"
              label="Typ"
              single-line
              hide-details
              class="pl-1"
              :menu-props="{
                closeOnClick: true,
                closeOnContentClick: true,
              }"
              @update:model-value="onSaveField(element)"
            ></v-select>
          </v-col>
          <v-col cols="1" class="py-2 pl-2">
            <v-btn
              icon
              size="x-small"
              variant="flat"
              @click="onDeleteField(element)"
            >
              <v-icon>
                mdi-window-close
              </v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </template>
    </draggable>
    <v-row justify="center">
      <DialogCategoryFieldNew
        :categoryID="categoryID"
        :categoryName="categoryName"
        :callbackFn="addFieldLocal"
      />
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { useConfirm } from 'vuetify-use-dialog'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useFieldsStore } from '@/store/fields'
import { useCategoriesStore } from '@/store/categories'

import DialogCategoryFieldNew from '@/components/orga/members/categories/DialogCategoryFieldNew.vue'

const createConfirm = useConfirm()

const fieldsStore = useFieldsStore()
const categoriesStore = useCategoriesStore()

const props = defineProps({
  categoryID: {
    type: String,
    required: true
  },
  updates: {
    type: Number,
    default: 0
  }
})

const possibleFieldTypes = ref([
  {
    id: 'Text',
    name: 'Text'
  },
  {
    id: 'Boolean',
    name: 'Ja/Nein'
  },
  {
    id: 'Gender',
    name: 'Geschlecht'
  },
  {
    id: 'Tel',
    name: 'Telefon'
  },
  {
    id: 'Email',
    name: 'E-Mail'
  },
  {
    id: 'Date',
    name: 'Datum'
  },
  {
    id: 'Time',
    name: 'Zeit'
  },
  {
    id: 'Datetime',
    name: 'Datum & Zeit'
  },
  {
    id: 'Number',
    name: 'Zahl'
  }
])

const loading = ref(false)

const fields = ref([])

const categoryName = categoriesStore.getByID(props.categoryID)?.name

onMounted(() => {
  fields.value = fieldsStore.getAllByCategoryID(props.categoryID)
  fields.value.forEach((field) => {
    field.changed = false
    field.loading = false
  })
})

const onSaveField = async (element) => {
  element.loading = true
  await fieldsStore.updateField(element.id, {
    name: element.name,
    type: element.type,
  })
  element.loading = false
  element.changed = false
  toast.success('Feld wurde gespeichert.')
}

const onDeleteField = async (element) => {
  const isConfirmed = await createConfirm({
    title: 'Feld löschen',
    content: 'Bist Du sicher?',
  })
  if (!isConfirmed) return
  fields.value = fields.value.filter(item => item.id !== element.id)
  await fieldsStore.deleteField(element.id)
    .catch((error) => {
      toast.error('Fehler beim Löschen des Feldes.' + error)
      return
    })
  toast.success('Feld gelöscht.')
}

const onResortedFields = async () => {
  fields.value.forEach(async (field) => {
    field.order = fields.value.indexOf(field)
    await fieldsStore.updateField(field.id, {
      order: field.order
    })
  })
  toast.success('Felder-Reihenfolge gespeichert.')
}

const addFieldLocal = (field) => {
  fields.value.push(field)
}
</script>
