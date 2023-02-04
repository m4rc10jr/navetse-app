<template>
  <page>
    <breadcrumb
      slot="header"
      title="Ordem de Produção"
      has-filter
      @filter:sync="syncFilter"
      @filter:close="cancelFilter"
      @search="$bus.$emit('dynamic-list:fetch', $event)"
      :options.sync="filter"
      :search-options="{
        placeholder: 'ID ou Valor',
      }"
    >
      <template slot="filters">
        <filter-order v-model="filter.column" :status="filter.data.status" />
      </template>
    </breadcrumb>

    <dynamic-list v-model="api" @edit="open">
      <template v-slot:item.icon>
        <custom-icon>category</custom-icon>
      </template>

      <template v-slot:item="{ item }">
        <v-list-item-title>
          <span>{{ item.entity.name }}</span>
        </v-list-item-title>

        <v-divider class="my-1" dark></v-divider>

        <v-list-item-subtitle v-if="item.items.length > 0">
          <chip
            small
            label
            outlined
            v-for="(row, index) in item.items"
            :key="`item-${index}`"
            @click="$router.push(`/records/item/${row.item_id}`)"
            :class="{ 'ml-1': index > 0 }"
          >
            <span>{{ row.quantity }}x {{ row.title }}</span>
          </chip>
        </v-list-item-subtitle>

        <v-list-item-subtitle v-else>
          <i>Items não informados</i>
        </v-list-item-subtitle>
      </template>

      <template v-slot:item.action="{ item }">
        <div class="d-flex flex-column align-end">
          <small>{{ item.created_at }}</small>
          <small class="mt-1">
            <b>{{ item.total | brl }}</b>
          </small>
        </div>
      </template>
    </dynamic-list>

    <button-add redirect="/production-orders/create" />
  </page>
</template>

<script>
import filter from '~/mixins/filter'

export default {
  name: 'ProductionOrderIndex',

  layout: 'dashboard',

  mixins: [filter],

  data: () => ({
    api: {
      endpoint: '/api/production-orders',
      filter: {},
      with: 'all',
    },

    filter: {
      column: {
        id: null,
        entity: null,
        item: null,
        status: null,
        date: null,
      },

      data: {
        status: [],
      },

      collection: 'production-order',
    },
  }),

  methods: {
    /**
     * Abrir editor.
     *
     * @param {*} event
     */
    open(event) {
      this.$router.push({
        name: 'production-orders-id',
        params: { id: event.id },
      })
    },
  },
}
</script>

<style lang="scss" scoped></style>
