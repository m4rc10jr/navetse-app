<template>
  <v-combobox
    v-model="model"
    :items="codes"
    :search-input.sync="search"
    label="Doc/Referência"
    small-chips
    hide-selected
    outlined
    hide-details
    item-text="code"
    item-value="code"
    :error-messages="errorMessages"
    cache-items
    dense
  >
    <template v-slot:no-data>
      <v-list-item>
        <v-list-item-content>
          <small>Pressione <kbd class="kbd">Enter</kbd> para inserir</small>
        </v-list-item-content>
      </v-list-item>
    </template>
  </v-combobox>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'InputDoc',

  props: {
    value: [String, Number],

    item: {
      type: Object,
      default: () => ({}),
    },

    hasSale: {
      type: Boolean,
      default: false,
    },

    errorMessages: {
      type: Array,
      default: () => [],
    },
  },

  data: () => ({
    search: '',
    items: [],
    loaded: false,
  }),

  computed: {
    model: {
      get() {
        return this.value
      },

      set(value) {
        this.$emit('input', value?.code ?? value)
      },
    },

    codes() {
      return this.items.sort((a, b) => a.code - b.code).filter((h) => h.code)
    },
    ...mapGetters({
      mainCompany: 'account/companyInUse',
    }),
  },

  watch: {
    async search(text) {
      const filter = String(text).trim().toLocaleLowerCase()

      if (!filter || filter.length < 2) {
        this.$emit('change', {})
        return
      }

      if (
        this.items.filter(
          (h) => h.code && h.code.toLocaleLowerCase().includes(filter)
        ).length > 0
      ) {
        return false
      }

      if (!this.loaded) {
        await this.fetch(text)
      }
    },
  },

  methods: {
    /**
     * Carregar dados da api.
     *
     * @param {*} search
     */
    async fetch(search = null) {
      this.loaded = false

      let params = {
        'scope[search][all]': search,
        'scope[search][paymentsnot]': true,
        'scope[withTrashed]': false,
        'where[type_payment_id]': 7, // cheque
        'where[origin_type]': 'sale',
        'scope[search][company_id]': this.mainCompany.id,
        select: 'id,value,code',
        limit: 25,
      }

      if (!search) {
        delete params['scope[search][all]']
      }

      const result = await this.$axios.$get('/api/installments', {
        params,
      })

      this.items = result
      this.loaded = true
    },

    /**
     * Emitir valor disponivel para uso no pagamento.
     *
     * @param {*} id
     */
    select(id = null) {
      const doc = this.items.find((h) => h.code === id) ?? {
        code: null,
        id: null,
        value: 0,
      }

      this.$emit('update', doc)
    },
  },
}
</script>
