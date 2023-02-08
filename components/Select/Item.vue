<template>
  <v-autocomplete
    label="Item"
    v-model="selected"
    outlined
    :items="filtered"
    :search-input.sync="search"
    :error-messages="errorMessages"
    @change="onSelect"
    cache-items
    v-bind="inputOptions"
    hide-details
    dense
  >
    <slot></slot>
  </v-autocomplete>
</template>

<script>
export default {
  name: 'SelectItem',

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

    limit: {
      type: Number,
      default: 10,
    },

    inputOptions: {
      type: Object,
      default: () => ({}),
    },
  },

  data: () => ({
    items: [],
    selected: null,
    search: '',
    loaded: false,
  }),

  watch: {
    search(value) {
      const filter = String(value).trim().toLocaleLowerCase()

      if (!filter || filter.length < 3) {
        this.$emit('change', {})
        return
      }

      if (
        this.filtered.filter(
          (h) => h.text && h.text.toLocaleLowerCase().includes(filter)
        ).length > 0
      ) {
        return false
      }

      this.load()
    },
  },

  computed: {
    filtered() {
      return this.items
        .filter((h) => h?.id)
        .map((h) => ({
          text: h.title,
          value: h.id,
        }))
        .filter((h) => h?.text)
    },

    id() {
      return this.selected && typeof this.selected === 'object'
        ? this.selected.value
        : this.selected
    },
  },

  methods: {
    async load() {
      this.loaded = false

      const params = {
        'orderBy[id]': 'desc',
        select: 'id,unit_id,title,cost',
        'includes[unit]': 'id,symbol,title',
        'scope[search]': this.search,
        limit: this.limit,
        'product[load]': true,
      }

      const data = await this.$axios.$get('/api/items', { params })
      this.items = data
      this.loaded = true
    },

    onSelect(event) {
      const item = this.items.find((h) => h.id === event)

      this.$emit('change', item)
    },
  },

  created() {
    this.items = [...this.data]
    this.selected = this.value

    this.$on('reset', () => {
      this.selected = null
    })
  },
}
</script>

<style lang="scss" scoped></style>
