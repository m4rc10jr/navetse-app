<template>
  <div
    class="d-flex justify-space-between flex-row align-center nav-items"
    :style="style"
    :class="{ mobile: isMobile }"
  >
    <slot :mobile="isMobile"></slot>
  </div>
</template>

<script>
export default {
  name: 'NatItems',

  props: {
    items: {
      type: Array,
      default: () => [],
    },

    minWidth: {
      type: String,
      default: '238px',
    },
  },

  computed: {
    style() {
      return {
        'min-width': this.minWidth,
      }
    },

    isMobile() {
      return this.$vuetify.breakpoint.xs
    },
  },
}
</script>

<style lang="scss" scoped>
.nav-items.mobile {
  min-width: 64px !important;
}
</style>
