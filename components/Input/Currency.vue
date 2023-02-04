<template>
  <vuetify-money
    v-model="currency"
    :error="error"
    :rules="errorMessages"
    :label="label"
    :options="options"
    :properties="defaultInputOptions"
    :disabled="disabled"
    v-bind="getInputOptions"
  />
</template>

<script>
export default {
  name: 'InputCurrency',

  props: {
    value: {
      type: [Number, String],
      default: 0,
    },

    label: {
      type: String,
      default: 'Valor',
    },

    errorMessages: {
      type: Array,
      default: () => [],
    },

    inputOptions: {
      type: Object,
      default: () => ({}),
    },

    disabled: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    options: {
      locale: 'pt-BR',
      prefix: 'R$',
      suffix: '',
      length: 11,
      precision: 2,
    },

    defaultInputOptions: {
      hideDetails: true,
      outlined: true,
      dense: true,
    },
  }),

  computed: {
    currency: {
      get() {
        return Number(this.value)
      },
      set(value) {
        this.$emit('input', Number(value))
      },
    },

    error() {
      return this.errorMessages.length > 0
    },

    getInputOptions() {
      return { ...this.defaultInputOptions, ...this.inputOptions }
    },
  },
}
</script>

<style></style>
