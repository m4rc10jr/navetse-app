<template>
  <v-fade-transition>
    <v-btn
      key="addButton"
      color="primary"
      fab
      fixed
      right
      bottom
      @click="onClick"
      large
      elevation-12
      style="right: 24px; bottom: 24px"
    >
      <custom-icon>add</custom-icon>
    </v-btn>
  </v-fade-transition>
</template>

<script>
export default {
  name: 'ButtonAdd',

  props: {
    redirect: {
      type: String,
      default: '',
    },
  },

  methods: {
    onClick() {
      if (this.redirect) {
        this.$router.push(this.redirect)
        return
      }

      this.$emit('click')
    },
  },
}
</script>

<style lang="scss" scoped></style>
