<template>
  <page>
    <breadcrumb
      slot="header"
      title="Orçamentos"
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

    <dynamic-list v-model="api" @edit="open" icon="calculate">
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
        <v-menu bottom left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item :key="`${item.id}-clone`" @click.stop="clone(item)">
              <v-list-item-title>Fazer Cópia</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-divider dark class="my-1"></v-divider>

        <div class="d-flex flex-column align-end">
          <small class="d-flex align-center">
            <custom-icon>{{
              item.associate ? 'link' : 'link_off'
            }}</custom-icon>

            <span class="ml-1">{{
              item.associate ? 'vinculado' : 'não vinculado'
            }}</span>
          </small>
          <small>{{ item.created_at }}</small>
          <small class="mt-1">
            <b>{{ item.total | brl }}</b>
          </small>
        </div>
      </template>
    </dynamic-list>

    <button-add redirect="/budgets/create" />
  </page>
</template>

<script>
import filter from '~/mixins/filter'

export default {
  name: 'BudgetIndex',

  layout: 'dashboard',

  mixins: [filter],

  data: () => ({
    api: {
      endpoint: '/api/budgets',
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

      collection: 'budget',
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
        name: 'budgets-id',
        params: { id: event.id },
      })
    },
    /**
     * Criar copia do registro.
     *
     * @param {*} item
     */
    async clone(item) {
      try {
        const payload = {
          entity_id: item.entity.id,
          employee_id: item.employee.id,
          date: item.date,
          discount: item.discount,
          addition: item.addition,
          description: `Orçamento copiado de #${item.id}`,
          value: item.value,
          items: item.items.map((h) => ({
            item_id: h.item_id,
            department_id: h.department_id,
            quantity: h.quantity,
            cost: h.cost,
          })),
        }

        const result = await this.$axios.$post('/api/budgets', payload)

        this.$bus.$emit('dynamic-list:sync', {
          created: true,
          result,
        })
      } catch (e) {
        this.$notify.error('Opss!', {
          description: this.$store.getters['request/message'],
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
