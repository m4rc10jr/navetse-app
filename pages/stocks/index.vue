<template>
  <page>
    <breadcrumb
      slot="header"
      title="Entrada da Estoque"
      has-filter
      @filter:sync="syncFilter"
      @filter:close="cancelFilter"
      @search="$bus.$emit('dynamic-list:fetch', $event)"
      :options.sync="filter"
      :search-options="{
        placeholder: 'ID, Custo ou Descrição',
      }"
    >
      <template v-slot:filters>
        <v-col md="3">
          <input-date
            label="Data Operação"
            v-model="filter.column.date"
            :default-date="false"
          />
        </v-col>

        <v-col md="5">
          <select-dynamic
            label="Item"
            endpoint="/api/items"
            :api-options="{ limit: 25, select: 'id,code,title' }"
            item-text="title"
            v-model="filter.column.item"
          />
        </v-col>
      </template>
    </breadcrumb>

    <dynamic-list v-model="api" @edit="open" icon="inventory">
      <template v-slot:item="{ item }">
        <v-list-item-title>
          <span>{{ item.item.title }}</span>
        </v-list-item-title>
        <v-divider class="my-1" dark></v-divider>
        <v-list-item-subtitle>
          <chip @click="$router.push(`/records/item/${item.item.id}`)">{{
            item.item.unit.title || item.item.unit.symbol || 'Não Indentificado'
          }}</chip>
        </v-list-item-subtitle>
        <v-list-item-subtitle class="mt-1 d-flex flex-column">
          <span
            >Valor por item: <b>{{ item.cost | brl }}</b></span
          >
          <v-divider class="py-1" dark></v-divider>
          <span
            >Total: <b>{{ item.cost_total | brl }}</b></span
          >
        </v-list-item-subtitle>
      </template>

      <template class="d-flex" v-slot:item.action="{ item }">
        <v-chip small color="primary">+{{ item.quantity }} Iten(s)</v-chip>

        <div class="d-flex flex-column align-end mt-1">
          <small>{{ item.created_at }}</small>
          <div class="d-flex mt-1 align-center">
            <custom-icon size="16px">update</custom-icon>
            <small class="ml-2">{{ item.updated_at }}</small>
          </div>
        </div>
      </template>
    </dynamic-list>

    <button-add redirect="/stocks/create" />
  </page>
</template>

<script>
import filter from '~/mixins/filter'

export default {
  name: 'StockIndex',

  layout: 'dashboard',

  mixins: [filter],

  data: () => ({
    api: {
      endpoint: '/api/products',
      filter: {},
      with: 'all',
    },

    filter: {
      column: {
        item: null,
        date: null,
      },

      data: {
        item: [],
      },

      collection: false,
    },
  }),

  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.smAndDown
    },
  },

  methods: {
    open(item) {
      this.$router.push(`/stocks/${item.id}`)
    },
  },
}
</script>

<style lang="scss" scoped></style>
