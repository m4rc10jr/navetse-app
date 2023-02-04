<template>
  <dynamic
    v-model="model"
    endpoint="/api/entities"
    :label="label"
    :errorMessages="errorMessages"
    :api-options="query"
  />
</template>

<script>
export default {
  name: 'SelectEntity',

  components: {
    dynamic: () => import('./Dynamic'),
  },

  props: {
    value: String | Number,

    label: {
      type: String,
      default: 'Pessoa',
    },

    onlyProvider: {
      type: Boolean,
      default: false,
    },

    errorMessages: {
      type: Array,
      default: () => [],
    },

    apiOptions: {
      type: Object,
      default: () => ({}),
    },
  },

  computed: {
    model: {
      get() {
        return this.value
      },

      set(value) {
        if (!value) return
        this.$emit('input', value)
      },
    },

    query() {
      let query = { select: 'id,name' }

      this.onlyProvider && (query['where[type_id]'] = 2)

      return { ...query, ...this.apiOptions }
    },
  },
}
</script>

<style lang="scss" scoped></style>
