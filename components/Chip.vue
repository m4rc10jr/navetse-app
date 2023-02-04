<template>
  <v-chip
    label
    small
    :outlined="outlined"
    :color="color"
    :disabled="disabled"
    @click.stop="$emit('click')"
  >
    <slot></slot>
  </v-chip>
</template>

<script>
export default {
  name: 'Chip',

  props: {
    color: {
      type: String,
      default: 'grey darken-1',
    },

    outlined: {
      type: Boolean,
      default: true,
    },

    disabled: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="scss" scoped></style>
