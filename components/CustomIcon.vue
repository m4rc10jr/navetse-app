<template>
  <span class="material-symbols-outlined" :style="style">
    <slot></slot>
  </span>
</template>

<script>
export default {
  name: 'CustomIcon',

  props: {
    size: {
      type: String,
      default: '20px',
    },
    color: {
      type: String,
      default: 'inherit',
    },
  },

  computed: {
    style() {
      return {
        fontSize: this.size,
        color: this.color,
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 48;
}
</style>
