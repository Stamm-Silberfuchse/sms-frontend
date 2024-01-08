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
          <DialogCategoryNew :callback-fn="addCategoryLocal" />
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
import DialogCategoryEdit from '@/components/orga/members/categories/DialogCategoryEdit.vue'
import DialogCategoryFieldNew from '@/components/orga/members/categories/DialogCategoryFieldNew.vue'
import EditFields from '@/components/orga/members/categories/EditFields.vue'

const createConfirm = useConfirm()

const categoriesStore = useCategoriesStore()

const loading = ref(false)
const categories = ref([])
const fields = ref([])

const formData = reactive({})

const notifyNewFieldRef = ref(null)

onMounted(() => {
  categories.value = categoriesStore.getAllSorted
  categories.value.forEach((category) => {
    formData[category.id] = category
  })
})

const fetchData = async() => {
  loading.value = true
  console.log("Fetching synchronously...")

  // fetch all categories
  await supabase.from('categories').select('*')
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        categories = data
        data.forEach((el) => {
          formData[el.id] = {
            name: el.name,
            name_intern: el.name_intern,
            fields: {}
          }
        })
      }
    })
    .catch((error) => {
      console.error(error)
      toast.error(error.message)
    })

  // fetch all member_fields
  await supabase.from('member_fields').select('*').neq('type', 'PLACEHOLDER')
    .then(({ data, error, status }) => {
      if (error && status !== 406) throw error
      if(data) {
        fields.value = data
        data.forEach((el) => {
          formData[el?.cat_id]["fields"][el?.id] = {
            type: el.type,
            name: el.name,
            field_name_intern: el.name_intern
          }
        })
      }
    })
    .catch((error) => {
      toast.error(error.message)
    })
    .finally(() => {
      loading.value = false
    })
}

const addCategoryLocal = (newCategory) => {
  categories.value.push(reactive(newCategory))
}

const editCategoryLocal = (id, name) => {
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

const addFieldLocal = (field) => {
  notifyNewFieldRef.value.addField(field)
}

const onResortedCategories = async (showToast=true) => {
  await categories.value.forEach(async (el, i) => {
    await categoriesStore.updateCategory(el.id, { order: i })
    categories.value[i].order = i
  })
  if (showToast) { toast.success('Kategorie-Reihenfolge gespeichert.') }
}
</script>

<style scoped>
.handleCategory {
  cursor: move;
}
</style>
