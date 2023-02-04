<template>
  <v-app>
    <v-main>
      <v-container fluid style="height: 100vh; overflow: hidden" class="py-0">
        <v-row
          justify="center"
          align="center"
          style="height: 100%"
          class="my-0"
        >
          <v-col
            :cols="colFlex"
            class="d-flex justify-center align-center banner"
            v-if="!['xs', 'sm'].includes($vuetify.breakpoint.name)"
          >
            <v-sheet
              color="transparent"
              style="text-align: center; width: 320px"
              class="justify-center align-center"
            >
              <logo />
            </v-sheet>
          </v-col>

          <v-col
            :cols="colFlex"
            :class="{ colored: isMobile }"
            style="height: 100%; background-color: white"
          >
            <v-row justify="center" align="center" style="height: 100%">
              <v-col cols="12">
                <v-sheet
                  color="white"
                  class="mx-auto pb-2"
                  style="width: 25vw"
                  v-if="isMobile"
                >
                  <logo :options="{ height: 64 }" />
                </v-sheet>
                <Nuxt />
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <Notify />
      </v-container>
    </v-main>

    <layout-footer />
  </v-app>
</template>

<script>
export default {
  data: () => ({}),

  computed: {
    colFlex() {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          return 12
        case 'sm':
          return 12
        default:
          return 6
      }
    },

    isMobile() {
      return ['xs', 'sm'].includes(this.$vuetify.breakpoint.name)
    },
  },
}
</script>

<style type="scss">
.banner {
  background-color: var(--primary);
  max-width: 100%;
  height: 100%;
  opacity: 0.8;
}

.colored {
  background-color: var(--primary);
}
</style>
