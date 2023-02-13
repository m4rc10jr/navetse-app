<template>
  <v-autocomplete
    v-model="model"
    :label="label"
    :items="filtered"
    :search-input.sync="search"
    :error-messages="errorMessages"
    :disabled="disabled"
    :loading="loading"
    :filter="customFilter"
    v-bind="inputOptions"
    @change="onSelect"
    @click:clear="$emit('input', null)"
  >
    <!-- <template v-slot:selection="{ item }">
    {{ selection(item.text) }}
  </template> -->
  </v-autocomplete>
</template>

<script>
import { get, deburr, capitalize, sortBy } from 'lodash'

export default {
  name: 'SelectDynamic',

  props: {
    value: String | Number | Array,

    endpoint: {
      type: String,
      default: '/api',
    },

    apiOptions: {
      type: Object,
      default: () => ({
        select: '*',
        limit: 10,
      }),
    },

    selectOptions: {
      type: Object,
      default: () => ({}),
    },

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
      default: 'Lista',
    },

    itemText: {
      type: String | Function,
      default: 'name',
    },

    itemValue: {
      type: String | Function,
      default: 'id',
    },

    noApiData: {
      type: Boolean,
      default: false,
    },

    loading: {
      type: Boolean,
      default: false,
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    autoload: {
      type: Boolean,
      default: true,
    },

    resumeText: {
      type: Boolean,
      default: false,
    },

    filterByValue: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    items: [],
    search: '',
    loaded: false,
    defaultApiOptions: {
      select: '*',
      limit: 25,
    },
    requestOptions: {},
    defaultSelectOptions: {
      outlined: true,
      dense: true,
      hideDetails: true,
      placeholder: 'Selecione...',
    },
  }),

  watch: {
    async search(value) {
      const filter = deburr(String(value).trim().toLocaleLowerCase())

      if (filter.length < 3) {
        return false
      }

      if (
        this.filtered.filter((h) =>
          deburr(String(h.text).trim().toLocaleLowerCase()).includes(filter)
        ).length > 0
      ) {
        return true
      }

      if (this.noApiData) {
        this.$emit('search', filter)
        return false
      }

      await this.load()
    },

    data(value) {
      this.items = value
    },

    errorMessages: {
      deep: true,
      handler(value) {
        this.$emit('errors', value)
      },
    },
  },

  computed: {
    filtered() {
      const items = this.items.map((h) => {
        return {
          text:
            typeof this.itemText === 'string'
              ? get(h, this.itemText)
              : this.itemText(h),
          value:
            typeof this.itemValue === 'string'
              ? get(h, this.itemValue)
              : this.itemValue(h),
          item: { ...h },
        }
      })

      return sortBy(items, 'text')
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

    selection() {
      return (text) => {
        const newText = String(text).split(' ').map(capitalize)

        return this.resumeText ? newText[0] : newText.join(' ')
      }
    },

    inputOptions() {
      return { ...this.defaultSelectOptions, ...this.selectOptions }
    },
  },

  methods: {
    async load() {
      const params = {
        'orderBy[id]': 'desc',
        'scope[search]': this.search,
        // 'scope[withTrashed]': Date.now(),
      }

      if (this.requestOptions) {
        for (let [key, value] of Object.entries(this.requestOptions)) {
          params[key] = value
        }
      }

      if (params.limit && params.limit === -1) {
        delete params.limit
      }

      const data = await this.$axios.$get(this.endpoint, { params })

      this.items = data
      this.loaded = true

      this.$emit('items', data)
    },

    onSelect(event) {
      const item = this.items.find((h) => h.id === event)
      this.$emit('change', item)
    },

    customFilter(item, queryText, itemText) {
      const normalize = (value) =>
        deburr(String(value).trim().toLocaleLowerCase())

      let has = normalize(itemText).includes(normalize(queryText))

      if (!has && this.filterByValue) {
        has = item.value === Number(queryText)
      }

      return has
    },

    refresh() {
      this.requestOptions = {
        ...this.defaultApiOptions,
        ...this.apiOptions,
      }

      this.items = [...this.data]
      this.model = this.value

      this.$forceUpdate()
    },
  },

  created() {
    this.refresh()

    this.$on('reset', () => {
      this.model = null
    })
  },

  mounted() {
    this.refresh()
  },
}
</script>

<style lang="scss" scoped></style>
