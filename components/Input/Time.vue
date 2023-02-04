<template>
  <v-menu
    ref="menu"
    v-model="open"
    :close-on-content-click="false"
    :nudge-right="40"
    :return-value.sync="model"
    transition="scale-transition"
    offset-y
    max-width="290px"
    min-width="290px"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-model="model"
        :label="label"
        append-icon="mdi-clock-time-four-outline"
        v-bind="attrs"
        v-on="on"
        outlined
        hide-details
        dense
        :error-messages="errorMessages"
      />
    </template>

    <v-time-picker
      v-if="open"
      v-model="model"
      @click:minute="$refs.menu.save(model)"
      color="primary"
      header-color="primary"
      format="24hr"
    />
  </v-menu>
</template>

<script>
export default {
  name: 'InputTime',

  props: {
    value: String,

    label: String,

    errorMessages: {
      type: Array,
      default: () => [],
    },
  },

  data: () => ({
    open: false,
  }),

  computed: {
    model: {
      get() {
        return this.value
      },

      set(value) {
        this.$emit('input', value)
      },
    },
  },

  created() {
    if (!this.model) {
      this.model = this.$helper.moment().format('HH:mm')
    }
  },
}
</script>

<style lang="scss" scoped></style>
