<template>
  <v-footer height="auto" class="grey darken-1" app style="font-size: 12px">
    <v-layout row wrap justify-center white--text>
      <v-flex xs12 py-3 style="text-align: center">
        &copy;{{ new Date().getFullYear() }} —
        <strong>NAVETSE</strong>
        <strong> ~ {{ release }}</strong>
      </v-flex>
    </v-layout>
  </v-footer>
</template>

<script>
export default {
  computed: {
    release() {
      return process.env.APP_RELEASE
    },
  },
}
</script>

<style lang="scss" scoped></style>
