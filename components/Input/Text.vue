<template>
  <v-text-field
    v-model.trim="model"
    v-bind="customOptions"
    :error-messages="errors"
    :label="label"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    @click:append="$emit('click:append')"
  />
</template>

<script>
export default {
  name: 'Input',

  props: {
    value: String | Number,

    label: {
      type: String,
      required: true,
    },

    placeholder: {
      type: String,
      default: '',
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    readonly: {
      type: Boolean,
      default: false,
    },

    errors: {
      type: Array,
      default: () => [],
    },

    options: {
      type: Object,
      default: () => ({}),
    },
  },

  data: () => ({
    baseOptions: {
      hideDetails: true,
      outlined: true,
      dense: true,
    },
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

    customOptions() {
      return { ...this.baseOptions, ...this.options }
    },
  },

  watch: {
    errors: {
      deep: true,
      handler(value) {
        this.$emit('errors', value)
      },
    },
  },
}
</script>

<style lang="scss" scoped></style>
