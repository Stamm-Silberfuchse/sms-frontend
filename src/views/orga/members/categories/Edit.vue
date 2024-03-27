<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
        <PageTitle title="Kategorien & Felder" :loading="loading" back>
          <v-col>
            <v-icon
            class="pb-1"
            icon="mdi-badge-account-horizontal"
            size="large"
            color="primary"
          />
          </v-col>
        </PageTitle>

        <!-- Buttons -->
        <v-row justify="start" class="mx-0 pt-0 px-3 pb-3">
          <DialogCategoryNew :onAddCategoryCallback="onAddCategoryLocal" />
        </v-row>

        <!-- Categories -->
          <draggable
            v-if="!loading"
            tag="div"
            v-model="categories"
            handle=".handleCategory"
            item-key="id"
            @end="onResortedCategories"
            class="v-row mx-0 mt-0 mb-4 list-group"
            style="padding-left: -20px;"
          >
            <template #item="{ element, index }">
              <v-col cols="12" md="6" lg="4" class="list-group-item">
                <EditCategory
                  :element="element"
                  :onEditCategoryCallback="onEditCategoryLocal"
                  :onDeleteCategoryCallback="deleteCategory"
                />
              </v-col>
            </template>
          </draggable>
        </div>
      </v-responsive>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { useConfirm } from 'vuetify-use-dialog'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { useCategoriesStore } from '@/store/categories'

import PageTitle from '@/components/PageTitle.vue'
import DialogCategoryNew from '@/components/orga/members/categories/DialogCategoryNew.vue'
import EditCategory from '@/components/orga/members/categories/EditCategory.vue'

const createConfirm = useConfirm()

const categoriesStore = useCategoriesStore()

const loading = ref(false)
const categories = ref([])

onMounted(() => {
  categories.value = categoriesStore.getAllSorted
})

const onAddCategoryLocal = (newCategory) => {
  categories.value.push(reactive(newCategory))
}

const onEditCategoryLocal = (id, name) => {
  categories.value.find(item => item.id === id).name = name
}

const deleteCategory = async (id) => {
  const isConfirmed = await createConfirm({
    title: 'Kategorie löschen',
    content: 'Bist Du sicher?',
  })
  if (!isConfirmed) return
  await categoriesStore.deleteCategory(id, true)
  categories.value = categories.value.filter(item => item.id !== id)
  categories.value.forEach((el, i) => { el.order = i })
  await onResortedCategories(false)
  toast.success('Kategorie gelöscht.')
}

const onResortedCategories = async (showToast=true) => {
  categories.value.forEach(async (el, i) => {
    await categoriesStore.updateCategory(el.id, { order: i })
    categories.value[i].order = i
  })
  if (showToast) { toast.success('Kategorie-Reihenfolge gespeichert.') }
}
</script>
