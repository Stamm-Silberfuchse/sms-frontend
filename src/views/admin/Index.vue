<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
        <PageTitle title="Administration" />

        <v-row
          justify="start"
          class="mx-0 mt-0 mb-4"
          style="padding-left: -20px;"
        >
          <v-col cols="12">
            <v-card class="mb-4 px-3">
              <v-card-text class="mb-6">
                <v-card-title class="text-h5 text--primary mb-5 px-0">
                  Userverwaltung
                </v-card-title>

                <v-row>
                  <v-col cols="12" md="6" lg="4">
                    <v-card
                      class="mx-auto"
                      color="primary"
                      variant="tonal"
                    >
                      <v-card-item class="pb-0">
                        <div>
                          <div class="text-overline mb-3">
                            Gesamtanzahl
                          </div>
                          <div class="text-center text-h3 font-quicksand font-weight-bold">
                            {{ usersStore.getAmountOfUsers }}
                          </div>
                          <!--
                            <div class="text-caption">Greyhound divisely hello coldly fonwderfully</div>
                          -->
                        </div>
                      </v-card-item>

                      <v-card-actions>
                        <v-btn
                          :to="{ name: 'Admin Nutzer' }"
                          class="text-none"
                        >
                          Alle User
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="6" lg="4">
                    <AdminCardStatus />
                  </v-col>
                  <v-col cols="12" md="6" lg="4">
                    <v-card
                      class="mx-auto"
                      color="primary"
                      variant="tonal"
                    >
                      <v-card-item class="pb-0">
                        <div>
                          <div class="text-overline mb-3">
                            Rollen
                          </div>
                          <div class="text-center text-h3 font-quicksand font-weight-bold">
                            5
                          </div>
                          <!--
                            <div class="text-caption">Greyhound divisely hello coldly fonwderfully</div>
                          -->
                        </div>
                      </v-card-item>

                      <v-card-actions>
                        <v-btn class="text-none">
                          Zuweisung bearbeiten
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            <v-card class="mb-4 px-3">
              <v-card-text class="mb-6">
                <v-card-title class="text-h5 text--primary mb-5 px-0">
                  Gruppenverwaltung
                </v-card-title>

                <v-row>
                  <v-col cols="12" md="6" lg="4" v-for="i in [1,2,3]" :key="i">
                    <v-card
                      class="mx-auto"
                      color="green"
                      variant="tonal"
                    >
                      <v-card-item class="pb-0">
                        <div>
                          <div class="text-overline mb-3">
                            Gesamt
                          </div>
                          <div class="text-center text-h3 font-quicksand font-weight-bold">
                            254
                          </div>
                          <!--
                            <div class="text-caption">Greyhound divisely hello coldly fonwderfully</div>
                          -->
                        </div>
                      </v-card-item>

                      <v-card-actions>
                        <v-btn>
                          Button
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            <v-card class="mb-4 px-3">
              <v-card-text class="mb-6">
                <v-card-title class="text-h5 text--primary mb-5 px-0">
                  Administration
                </v-card-title>

                <v-row>
                  <v-col cols="12" md="6" lg="4" v-for="i in [1,2,3]" :key="i">
                    <v-card
                      class="mx-auto"
                      color="orange"
                      variant="tonal"
                    >
                      <v-card-item class="pb-0">
                        <div>
                          <div class="text-overline mb-3">
                            Gesamt
                          </div>
                          <div class="text-center text-h3 font-quicksand font-weight-bold">
                            254
                          </div>
                          <!--
                            <div class="text-caption">Greyhound divisely hello coldly fonwderfully</div>
                          -->
                        </div>
                      </v-card-item>

                      <v-card-actions>
                        <v-btn>
                          Button
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            <v-card class="mb-4 px-3">
              <v-card-text class="mb-6">
                <v-card-title class="text-h5 text--primary mb-5 px-0">
                  Administration
                </v-card-title>

                <v-row>
                  <v-col cols="12" md="6" lg="4" v-for="i in [1,2,3]" :key="i">
                    <v-card
                      class="mx-auto"
                      color="blue"
                      variant="tonal"
                    >
                      <v-card-item class="pb-0">
                        <div>
                          <div class="text-overline mb-3">
                            Gesamt
                          </div>
                          <div class="text-center text-h3 font-quicksand font-weight-bold">
                            254
                          </div>
                          <!--
                            <div class="text-caption">Greyhound divisely hello coldly fonwderfully</div>
                          -->
                        </div>
                      </v-card-item>

                      <v-card-actions>
                        <v-btn>
                          Button
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            <v-card class="mb-4 px-3">
              <v-card-text class="mb-6">
                <v-card-title class="text-h5 text--primary mb-5 px-0">
                  Administration
                </v-card-title>

                <v-row>
                  <v-col cols="12" md="6" lg="4" v-for="i in [1,2,3]" :key="i">
                    <v-card
                      class="mx-auto"
                      color="pink"
                      variant="tonal"
                    >
                      <v-card-item class="pb-0">
                        <div>
                          <div class="text-overline mb-3">
                            Gesamt
                          </div>
                          <div class="text-center text-h3 font-quicksand font-weight-bold">
                            254
                          </div>
                          <!--
                            <div class="text-caption">Greyhound divisely hello coldly fonwderfully</div>
                          -->
                        </div>
                      </v-card-item>

                      <v-card-actions>
                        <v-btn>
                          Button
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            <v-card class="mb-4 px-3">
              <v-card-text class="mb-6">
                <v-card-title class="text-h5 text--primary mb-5 px-0">
                  Administration
                </v-card-title>

                <v-row>
                  <v-col cols="12" md="6" lg="4" v-for="i in [1,2,3]" :key="i">
                    <v-card
                      class="mx-auto"
                      color="lime"
                      variant="tonal"
                    >
                      <v-card-item class="pb-0">
                        <div>
                          <div class="text-overline mb-3">
                            Gesamt
                          </div>
                          <div class="text-center text-h3 font-quicksand font-weight-bold">
                            254
                          </div>
                          <!--
                            <div class="text-caption">Greyhound divisely hello coldly fonwderfully</div>
                          -->
                        </div>
                      </v-card-item>

                      <v-card-actions>
                        <v-btn>
                          Button
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { useUsersStore } from '@/store/users'

import PageTitle from '@/components/PageTitle.vue'
import AdminCardStatus from '@/components/admin/AdminCardStatus.vue'

const usersStore = useUsersStore()

</script>
