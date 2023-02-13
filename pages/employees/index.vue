<template>
  <page>
    <breadcrumb
      slot="header"
      title="Funcionários"
      has-filter
      @filter:sync="syncFilter"
      @filter:close="cancelFilter"
      @search="$bus.$emit('dynamic-list:fetch', $event)"
      :options="filter"
      :search-options="{
        placeholder: 'Nome, Email, Telefone',
      }"
    >
      <template v-slot:filters>
        <v-col cols md="3">
          <input-text label="Ocupação" v-model="filter.column.ocupation" />
        </v-col>

        <v-col cols md="5">
          <v-row :class="{ 'flex-column': isMobile }">
            <v-col cols>
              <select-default
                label="Operador"
                v-model="filter.column.remuneration[0]"
                :items="filter.data.operators"
              />
            </v-col>

            <v-col cols>
              <input-currency
                label="Remuneração"
                v-model="filter.column.remuneration[1]"
              />
            </v-col>
          </v-row>
        </v-col>
      </template>
    </breadcrumb>

    <dynamic-list v-model="api" @edit="open">
      <template v-slot:item.icon>
        <custom-icon>badge</custom-icon>
      </template>

      <template v-slot:item="{ item }">
        <v-list-item-title style="font-size: 15px" v-text="item.name" />
        <v-list-item-subtitle v-if="item.salaries.length > 0" class="pt-1">
          <div class="d-flex flex-column">
            <span style="font-size: 14px">{{
              item.salaries[0].ocupation
            }}</span>
            <v-divider class="py-1" dark></v-divider>
            <b style="font-size: 14px" v-if="item.salaries.length > 0"
              >{{ item.salaries[0].liquid | brl }}/mês</b
            >
          </div>
        </v-list-item-subtitle>

        <v-list-item-subtitle
          v-else
          v-text="'Não informado'"
          style="font-size: 14px"
        />
      </template>

      <template v-slot:item.action="{ item }">
        <v-btn
          class="mb-2"
          x-small
          :color="item.inactive_at ? 'error' : 'primary'"
          depressed
          rounded
          @click.stop="toggleStatus(item)"
        >
          <v-slide-y-reverse-transition mode="out-in">
            <span :key="`${item.id}-active`" v-if="!item.inactive_at"
              >Ativo</span
            >
            <span :key="`${item.id}-inactive`" v-else>Inativo</span>
          </v-slide-y-reverse-transition>
        </v-btn>

        <div class="d-flex flex-column align-end mt-1">
          <small>{{ item.created_at }}</small>
          <div class="d-flex mt-1 align-center">
            <custom-icon size="16px">update</custom-icon>
            <small class="ml-2">{{ item.updated_at }}</small>
          </div>
        </div>
      </template>
    </dynamic-list>

    <button-add @click="open()" />
  </page>
</template>

<script>
import filter from '~/mixins/filter'

export default {
  name: 'EmployeeIndex',

  layout: 'dashboard',

  mixins: [filter],

  data: () => ({
    api: {
      endpoint: '/api/employees',
      filter: {},
      with: 'all',
    },

    filter: {
      column: {
        ocupation: null,
        remuneration: ['>=', 0],
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
      },
    },

    pageName: 'employees-id',

    item: {},
  }),

  computed: {
    isNew() {
      return !this.item?.id
    },

    isMobile() {
      return this.$vuetify.breakpoint.smAndDown
    },
  },

  methods: {
    /**
     * Salvar.
     *
     * @param {*} item
     */
    save(item) {
      this.$bus.$emit('dynamic-list:sync', item)
    },

    /**
     * Remover.
     *
     * @param {*} id
     */
    remove(id) {
      this.$bus.$emit('dynamic-list:remove', id)
    },

    /**
     * Abrir editor.
     *
     * @param {*} event
     */
    open(event) {
      this.$router.push({
        name: this.pageName,
        params: { id: event?.id ?? 'create' },
      })
    },

    /**
     * Altera status do empregado.
     *
     * @param {*} item
     */
    async toggleStatus(item) {
      const method = item.inactive_at ? '$patch' : '$delete'
      const endpoint = item.inactive_at
        ? `${this.api.endpoint}/${item.id}/restore`
        : `${this.api.endpoint}/${item.id}`

      try {
        const data = await this.$axios[method](endpoint)

        item.inactive_at = method === '$delete' ? this.$helper.moment() : null

        if (data) {
          item = { ...data }
        }
      } catch (e) {
        this.$notify.error(e.response.data.message)
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
