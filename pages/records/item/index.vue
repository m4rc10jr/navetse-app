<template>
  <page>
    <breadcrumb
      slot="header"
      title="Itens de Venda"
      has-filter
      @filter:sync="syncFilter"
      @filter:close="cancelFilter"
      @search="$bus.$emit('dynamic-list:fetch', $event)"
      :options="filter"
      :search-options="{
        placeholder: 'ID, Nome e Grupo',
      }"
    >
      <template v-slot:filters>
        <v-layout>
          <v-col cols md="3">
            <select-default
              label="Tipo"
              :items="filter.data.types"
              v-model="filter.column.type"
            />
          </v-col>
          <v-col cols md="5">
            <v-layout row>
              <v-col cols>
                <select-default
                  label="Operador"
                  v-model="filter.column.cost[0]"
                  :items="filter.data.operators"
                />
              </v-col>
              <v-col cols>
                <input-currency label="Custo" v-model="filter.column.cost[1]" />
              </v-col>
            </v-layout>
          </v-col>
        </v-layout>
      </template>
    </breadcrumb>

    <dynamic-list v-model="api" @edit="open" icon="shopping_cart">
      <template v-slot:item="{ item }">
        <v-list-item-title>
          <span>{{ item.title }}</span>
        </v-list-item-title>

        <v-list-item-subtitle class="mt-1">
          <div class="d-flex column">
            <chip>{{ item.group || 'Sem Grupo' }}</chip>
            <v-divider class="px-1" dark vertical></v-divider>
            <chip>{{ item.unit.title || '(sem unidade)' }}</chip>
            <v-divider class="px-1" dark vertical></v-divider>
            <chip>{{ item.type_label | capitalize }}</chip>
            <utils-show :condition="item.entity && !!item.entity.name">
              <v-divider class="px-1" dark vertical></v-divider>
              <chip color="primary" v-if="item.entity && item.entity.id">{{
                item.entity.name
              }}</chip>
            </utils-show>
          </div>
        </v-list-item-subtitle>

        <v-list-item-subtitle>
          <div class="d-flex flex-column">
            <span class="mt-2">
              Custo: <b>{{ item.cost | brl }}</b>
            </span>
            <span class="mt-1">
              Preço Sugerido: <b>{{ item.suggested_price | brl }}</b>
            </span>
          </div>
        </v-list-item-subtitle>
      </template>
    </dynamic-list>

    <button-add @click="open" />
  </page>
</template>

<script>
import filter from '~/mixins/filter'

export default {
  name: 'ItemIndex',

  layout: 'dashboard',

  mixins: [filter],

  data: () => ({
    api: {
      endpoint: '/api/items',
      filter: {
        with: 'all',
      },
    },

    filter: {
      column: {
        cost: ['>=', 0],
        type: null,
      },

      collection: false,

      data: {
        operators: [
          { text: 'Igual à', value: '=' },
          { text: 'Menor que', value: '<' },
          { text: 'Maior que', value: '>' },
          { text: 'Menor ou igual à', value: '<=' },
          { text: 'Maior ou igual à', value: '>=' },
        ],

        types: [
          { text: 'Produto', value: 'product' },
          { text: 'Insumo', value: 'input' },
          { text: 'Serviço', value: 'service' },
          { text: 'Todos', value: null },
        ],
      },
    },

    pageName: 'records-item-id',

    item: {},
  }),

  methods: {
    open(item) {
      return this.$router.push({
        name: this.pageName,
        params: { id: item?.id ?? 'create' },
      })
    },
  },
}
</script>

<style lang="scss" scoped></style>
