<template>
  <v-autocomplete
    label="Envolvido"
    :items="filtered"
    v-model="model"
    @change="onSelect"
    outlined
    hide-details
    dense
    :error-messages="errorMessages"
  >
    <slot></slot>
  </v-autocomplete>
</template>

<script>
export default {
  name: 'SelectClient',

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
  },

  data: () => ({
    items: [],
    search: '',
    loaded: false,
  }),

  computed: {
    model() {
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
        this.$emit('input', value)
      },
    },

    filtered() {
      return this.items.map((h) => ({
        text: h.name,
        value: h.id,
        item: { ...h },
      }))
    },
  },

  methods: {
    async load() {
      const params = {
        select: 'id,name,phone',
        'orderBy[id]': 'desc',
      }

      const data = await this.$axios.$get('/api/entities', {
        params,
      })
      this.items = data
      this.loaded = true
    },

    onSelect(event) {
      const item = this.items.find((h) => h.id === event)

      this.$emit('change', item)
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
