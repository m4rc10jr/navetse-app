<template>
  <v-alert
    :type="type"
    :key="`alert-${uniqueId}`"
    v-bind="defaultOptions"
    :color="`${type} darken-1`"
  >
    <slot></slot>
  </v-alert>
</template>

<script>
import { randomBytes } from 'crypto'

export default {
  name: 'Alert',

  props: {
    type: {
      type: String,
      default: 'info',
    },

    value: {
      type: Boolean,
      default: false,
    },

    options: {
      type: Object,
      default: () => ({}),
    },
  },

  data: () => ({
    defaultOptions: {
      border: 'left',
      coloredBorder: false,
      outlined: true,
      dense: true,
    },
  }),

  watch: {
    options: {
      deep: true,
      handler(value) {
        this.defaultOptions = { ...this.defaultOptions, ...value }
      },
    },
  },

  computed: {
    key() {
      return randomBytes(8).toString('hex')
    },

    uniqueId() {
      return randomBytes(8).toString('hex')
    },
  },
}
</script>

<style lang="scss" scoped></style>
