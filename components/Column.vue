<template>
  <v-col cols :class="column" :style="style">
    <slot></slot>
  </v-col>
</template>

<script>
export default {
  name: 'Column',

  props: {
    md: {
      type: Number | String,
      default: 4,
    },

    sm: {
      type: Number | String,
      default: 12,
    },

    xs: {
      type: Number | String,
      default: 12,
    },

    full: {
      type: Boolean,
      default: false,
    },

    width: {
      type: [String, Number],
      default: 0,
    },
  },

  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.xs
    },

    sizes() {
      return {
        md: this.md,
        sm: this.sm,
        xs: this.xs,
      }
    },

    itemPerRow() {
      return this.isMobile ? 1 : this.perRow
    },

    setup() {
      return {
        xs: () => ({ xs: this.xs }),
        sm: () => ({ sm: this.sm }),
        default: () => ({ md: this.md }),
      }
    },

    options() {
      return Object.keys(this.setup).includes(this.$vuetify.breakpoint.name)
        ? this.setup[this.$vuetify.breakpoint.name]()
        : this.setup.default()
    },

    column() {
      if (this.full || this.isMobile) return 'col-12'

      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          return `col-${this.xs}`
        case 'sm':
          return `col-${this.sm}`
        default:
          return `col-${this.md}`
      }
    },

    style() {
      let prop = {}

      if (this.width !== 0) {
        prop.width = this.width
        prop.maxWidth = this.width
      }

      if (this.isMobile) {
        prop.width = '100%'
        prop.maxWidth = '100%'
      }

      return prop
    },
  },
}
</script>

<style lang="scss">
.layout.row.mobile {
  flex-direction: column;
}
</style>
