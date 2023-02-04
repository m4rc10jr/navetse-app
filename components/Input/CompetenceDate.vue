<template>
  <select-default
    v-model="model"
    :error-messages="errorMessages"
    :items="dates"
    :label="label"
    :default-order="false"
    :options="{
      itemText: 'text',
      itemValue: 'value',
      valueComparator: valueComparator,
    }"
    autocomplete
  />
</template>

<script>
import { orderBy } from 'lodash'

export default {
  props: {
    value: [String],

    label: {
      type: String,
      default: 'Mês de Competência',
    },

    errorMessages: Array,
  },

  components: {
    SelectDefault: () => import('../Select/Default'),
  },

  computed: {
    model: {
      get() {
        if (!this.value) {
          this.$emit('input', this.$helper.moment().format('YYYY-MM-01'))
        }

        return this.value
      },

      set(value) {
        this.$emit('input', value)
      },
    },

    dates() {
      return orderBy(this.$helper.monthGenerator(), (h) => h.value, 'asc')
    },
  },

  methods: {
    /**
     * @param {*} a
     * @param {*} b
     */
    valueComparator(a, b) {
      try {
        const pattern = /\d{4}-\d{2}/
        const [factA, factB] = [a.match(pattern), b.match(pattern)]
        if (!factB || factB.length === 0) return false
        return factA[0] === factB[0]
      } catch (e) {
        return false
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
