<template>
  <page>
    <breadcrumb
      slot="header"
      title="Vendas"
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
        <filter-order
          v-model="filter.column"
          :status="filter.data.status"
          has-sale
        />
      </template>
    </breadcrumb>

    <dynamic-list v-model="api" @edit="open">
      <template v-slot:item="{ item }">
        <v-list-item-title>
          <span>{{ item.entity.name }}</span>
        </v-list-item-title>

        <v-divider class="my-1" dark></v-divider>
        <v-list-item-subtitle>
          <chip
            v-for="(row, index) in item.items"
            :key="`item-${index}`"
            @click="$router.push(`/records/item/${row.item_id}`)"
            :class="{ 'ml-1': index > 0 }"
          >
            <span>{{ row.quantity }}x {{ row.title }}</span>
            <b class="ml-1" v-if="!row.delivery_date">(não entregue)</b>
          </chip>

          <chip
            :outlined="false"
            v-for="(resume, index) in item.resumePayments"
            :key="`resume-payment-${index}`"
            :class="{
              'ml-1': index > 0,
              'white--text': resume.status === 'Andamento',
            }"
            :color="
              resume.status !== 'Andamento' ? 'primary' : 'grey lighten-1'
            "
          >
            Parcela {{ index + 1 }}º ({{ resume.type }})
          </chip>
        </v-list-item-subtitle>
        <!-- <v-list-item-subtitle v-if="item.items.length > 0">
        </v-list-item-subtitle>

        <v-list-item-subtitle v-else>
          <i>Items não informados</i>
        </v-list-item-subtitle> -->
      </template>

      <template v-slot:item.action="{ item }">
        <div class="d-flex flex-column align-end">
          <v-chip
            small
            :color="item.status === 'Em Aberto' ? 'grey' : 'primary darken-2'"
            dark
          >
            {{ item.status }}
          </v-chip>
          <small class="my-1">{{ item.date | formatDate('DD/MM/YYYY') }}</small>
          <small>
            <b>{{ item.total | brl }}</b>
          </small>
        </div>
      </template>
    </dynamic-list>

    <button-add redirect="/sales/create" />
  </page>
</template>

<script>
import filter from '~/mixins/filter'

export default {
  name: 'InputIndex',

  layout: 'dashboard',

  mixins: [filter],

  data: () => ({
    api: {
      endpoint: '/api/sales?resumePayments=*',
      filter: {},
      with: 'all',
    },

    filter: {
      column: {
        id: null,
        entity: null,
        item: null,
        status: 'all',
        date: null,
      },

      data: {
        status: [],
      },

      collection: 'sale',
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
        name: 'sales-id',
        params: { id: event.id },
      })
    },

    openItem({ item }) {
      this.$router.push({
        name: 'records-item-id',
        params: {
          id: item.id,
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped></style>
