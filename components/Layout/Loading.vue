<template>
  <div class="text-center">
    <v-dialog
      v-model="loading"
      hide-overlay
      persistent
      width="300"
      content-class="global-loader"
    >
      <v-card color="primary" dark>
        <v-card-text class="pt-5">
          <span>Aguarde...</span>
          <v-progress-linear indeterminate color="white" class="mb-0" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('request', ['loading']),
  },
}
</script>

<style lang="scss">
div.v-dialog__content:has(.global-loader) {
  z-index: 999 !important;
}
</style>
