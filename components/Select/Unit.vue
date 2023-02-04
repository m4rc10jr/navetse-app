<template>
  <v-autocomplete
    label="Unidade"
    :items="filtered"
    v-model="selected"
    @change="onSelect"
    hide-details
    dense
    outlined
    :error-messages="errorMessages"
  >
    <slot></slot>
  </v-autocomplete>
</template>

<script>
import { orderBy } from 'lodash'
export default {
  name: 'SelectUnit',

  props: {
    value: String | Number,

    errorMessages: {
      type: Array,
      default: () => [],
    },

    valid: {
      type: Boolean,
      default: false,
    },

    data: {
      type: Array,
      default: () => [],
    },
  },

  data: () => ({
    items: [],
    selected: null,
    search: '',
    loaded: false,
  }),

  computed: {
    filtered() {
      return orderBy(
        this.items.map((h) => ({
          text: h.title,
          value: h.id,
          item: { ...h },
        })),
        'text',
        'asc'
      )
    },
  },

  methods: {
    async load() {
      const params = {
        'orderBy[id]': 'desc',
        select: 'id,title,symbol',
      }

      if (this.selected?.value ?? this.selected) {
        params['orWhere[id]'] = this.selected?.value ?? this.selected
      }

      const data = await this.$axios.$get('/api/units', { params })
      this.items = data
      this.loaded = true
    },

    onSelect(event) {
      this.$emit(
        'change',
        this.items.find((h) => h.id === event)
      )
    },
  },

  created() {
    this.load()
    this.items = [...this.data]
    this.selected = this.value

    this.$on('reset', () => {
      this.selected = null
    })
  },
}
</script>

<style lang="scss" scoped></style>
