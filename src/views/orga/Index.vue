<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <div class="main-div">
        <PageTitle title="Verwaltung">
          <v-col>
            <v-icon
            class="pb-1"
            icon="mdi-account-group"
            size="large"
            color="primary"
          />
          </v-col>
        </PageTitle>

        <v-row class="mx-0">
          <v-col cols="12" md="3">
            <MembersCard />
          </v-col>
          <v-col cols="12" md="3">
            <GroupsCard />
          </v-col>
        </v-row>
      </div>
    </v-responsive>
  </v-container>
</template>

<script setup>
import PageTitle from '@/components/PageTitle.vue'
import MembersCard from '@/components/orga/MembersCard.vue'
import GroupsCard from '@/components/orga/GroupsCard.vue'
</script>
