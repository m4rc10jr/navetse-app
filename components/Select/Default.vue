<template>
  <component
    :is="component"
    v-model.trim="model"
    :error-messages="errors"
    :label="label"
    :items="itemsMapped"
    outlined
    dense
    hide-details
    v-bind="syncOptions"
  />
</template>

<script>
import { orderBy } from 'lodash'
export default {
  name: 'SelectDefault',

  props: {
    value: String | Number,

    label: {
      type: String,
      required: true,
    },

    items: {
      type: Array,
      default: () => [],
    },

    errors: {
      type: Array,
      default: () => [],
    },

    options: {
      type: Object,
      default: () => ({}),
    },

    map: {
      type: Function,
      default: (h) => h,
    },

    defaultOrder: {
      type: Boolean,
      default: true,
    },

    autocomplete: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    selectOptions: {
      itemText: 'text',
      itemValue: 'value',
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

    itemsMapped() {
      const items = this.items.map(this.map)

      if (!this.defaultOrder) return items

      return orderBy(items, 'text', 'asc')
    },

    syncOptions() {
      return { ...this.selectOptions, ...this.options }
    },

    component() {
      return this.autocomplete ? 'v-autocomplete' : 'v-select'
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
