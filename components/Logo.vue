<template>
  <img
    class="vuetify-logo"
    alt="FS Consultoria"
    :src="logo"
    :class="{ inverse }"
  />
</template>

<script>
export default {
  props: {
    icon: {
      type: Boolean,
      default: false,
    },

    inverse: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    logo() {
      return this.icon ? '/logo-icon.png' : '/logo.png'
    },
  },
}
</script>

<style>
.vuetify-logo {
  width: 100%;
}

.inverse {
  filter: invert();
}
</style>
