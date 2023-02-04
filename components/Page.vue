<template>
  <v-container fluid>
    <v-row>
      <slot name="header"></slot>

      <slot name="row"></slot>

      <v-col cols="12">
        <slot></slot>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {},
}
</script>

<style lang="scss" scoped></style>
