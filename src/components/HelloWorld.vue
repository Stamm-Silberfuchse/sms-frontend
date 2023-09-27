<template>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height">

      <v-img height="240" src="@/assets/logo_rot.svg" />

      <div class="text-body-2 font-weight-light pt-8 mb-2">Welcome to</div>

      <h1 class="text-h3 font-weight-bold font-quicksand">Silberfuchs Management System</h1>

      <div class="py-14" />

      <v-row class="d-flex align-center justify-center">
        <v-col cols="auto">
          <v-btn
            :to="{ name: 'Mail' }"
            min-width="164"
            variant="text"
            class="text-none"
          >
            <v-icon
              icon="mdi-email-outline"
              size="large"
              start
            />
            Mails
          </v-btn>
        </v-col>

        <v-col cols="auto">
          <v-btn
            :to="{ name: 'Fundsachen' }"
            min-width="164"
            variant="text"
            class="text-none"
          >
            <v-icon
              icon="mdi-tag-multiple-outline"
              size="large"
              start
            />
            Fundstücke
          </v-btn>
        </v-col>

        <!--
        <v-col cols="auto">
          <v-btn
            color="primary"
            min-width="228"
            size="x-large"
            variant="flat"
            class="text-none"
            :to="{ name: 'Mitgliederverwaltung' }"
          >
            <v-icon
              icon="mdi-account-group"
              size="large"
              start
            />
            Mitglieder
          </v-btn>
        </v-col>
        -->

        <v-col cols="auto">
          <v-btn
            min-width="164"
            variant="text"
            :to="{ name: 'Kalender' }"
            class="text-none"
          >
            <v-icon
              icon="mdi-calendar-outline"
              size="large"
              start
            />
            Kalender
          </v-btn>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script setup>
  //
</script>
