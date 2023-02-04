<template>
  <div v-if="condition" class="d-flex">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'UtilsShow',

  props: {
    condition: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="scss" scoped></style>
