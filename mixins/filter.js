import { cloneDeep } from "lodash"

export default {
  data: () => ({
    filter: {
      column: {},
      data: {},
      collection: false
    },

    baseApiFilter: '/api/:name',
  }),

  computed: {
    getApiFilter() {
      return String(this.baseApiFilter).replace(':name', this.filter.collection)
    },

    isFilterRequest() {
      return !!this.filter.collection
    },
  },

  methods: {
    /**
     * Sincronizar filtros.
     *
     * @param {*} value
     */
    syncFilter(value) {
      this.api.filter = {...value}
      this.$forceUpdate()
    },

    /**
     * Cancelar filtros.
     *
     * @param {*} value
     */
    cancelFilter(value) {
      this.filter.column = {...value.column}
      this.$forceUpdate()
    },

    /**
     * Carregar dados para consulta avançada.
     *
     * @returns {void}
     */
    async loadFilterData() {
      const result = await this.$axios.$options(this.getApiFilter)

      this.filter.data = {...result}
    },
  },

  async mounted() {
    if (!this.isFilterRequest) {
      return;
    }

    try {
      await this.loadFilterData()
    } catch (e) {
      console.warn('falhou ao carregar recursos para filtro.', e.message, e?.data)
    }
  }
}
