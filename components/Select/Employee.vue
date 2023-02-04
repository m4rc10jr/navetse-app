<template>
  <v-autocomplete
    :label="label"
    :items="filtered"
    v-model="model"
    @change="onSelect"
    outlined
    :error-messages="errorMessages"
    hide-details
    dense
  >
    <slot></slot>
  </v-autocomplete>
</template>

<script>
export default {
  name: 'SelectEmployee',

  props: {
    value: String | Number,

    errorMessages: {
      type: Array,
      default: () => [],
    },

    data: {
      type: Array,
      default: () => [],
    },

    label: {
      type: String,
      default: 'Responsável',
    },
  },

  data: () => ({
    search: '',
    items: [],
    loaded: false,
  }),

  computed: {
    filtered() {
      return this.items.map((h) => ({
        text: h.name,
        value: h.id,
        item: { ...h },
      }))
    },

    model: {
      get() {
        return this.value
      },

      set(value) {
        if (!value) return
        this.$emit('input', value)
      },
    },
  },

  methods: {
    async load() {
      const params = {
        select: 'id,name',
        'orderBy[id]': 'desc',
      }

      const data = await this.$axios.$get('/api/employees', { params })
      this.items = data
      this.loaded = true

      this.$emit('items', this.items)
    },

    onSelect(event) {
      const item = this.items.find((h) => h.id === event)

      this.$emit('change', item)
    },
  },

  created() {
    this.load()
    this.items = [...this.data]
    this.model = this.value

    this.$on('reset', () => {
      this.model = null
    })
  },
}
</script>

<style lang="scss" scoped></style>
