<template>
  <v-col cols="12">
    <v-toolbar flat color="transparent" class="breadcrumb">
      <v-sheet flat class="d-flex align-center" color="transparent">
        <custom-icon v-if="icon">{{ icon }}</custom-icon>
        <span class="headline" :class="{ 'ml-1': !!icon }">{{ title }}</span>
      </v-sheet>

      <v-spacer></v-spacer>

      <slot></slot>

      <!-- beign: menu -->
      <v-menu v-if="menu.length > 0" transition="slide-y-transition" bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="accent" dark v-bind="attrs" v-on="on" icon>
            <custom-icon>menu</custom-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(menu, index) in menu"
            :key="index"
            @click="$emit(menu.action)"
          >
            <slot name="menu-item">
              <v-list-item-action v-if="menu.icon">
                <custom-icon>{{ menu.icon }}</custom-icon>
              </v-list-item-action>
              <v-list-item-title>{{ menu.title }}</v-list-item-title>
            </slot>
          </v-list-item>
        </v-list>
      </v-menu>
      <!-- end: menu -->

      <!--  -->
      <v-btn text @click="filter.model = !filter.model" v-if="hasFilter">
        <v-slide-x-reverse-transition mode="out-in">
          <div
            key="filter_list_off"
            v-if="filter.model"
            class="d-flex flex-row justify-center align-center"
          >
            <custom-icon>filter_list_off</custom-icon>
            <span class="hidden-xs-only">Limpar</span>
          </div>

          <div
            key="filter_list"
            class="d-flex flex-row justify-center align-center"
            v-else
          >
            <custom-icon>filter_list</custom-icon>
            <span class="hidden-xs-only">Filtro</span>
          </div>
        </v-slide-x-reverse-transition>
      </v-btn>
      <!--  -->
    </v-toolbar>

    <v-slide-y-transition>
      <v-layout row v-if="filter.model">
        <v-col cols="12">
          <v-card dense color="grey lighten-5">
            <v-card-title>
              <custom-icon>search</custom-icon>
              <span class="ml-2">Faça uma Busca</span>
            </v-card-title>
            <v-card-text>
              <v-layout row>
                <slot name="filter.one_line"></slot>
                <v-col cols :md="isRoot || isAdmin ? 3 : 6">
                  <v-text-field
                    v-model.trim="filter.search"
                    label="Pesquisa"
                    outlined
                    hide-details
                    dense
                    prepend-inner-icon="mdi-magnify"
                    v-bind="searchOptions"
                  />
                </v-col>

                <v-col md="3" v-if="isRoot || isAdmin">
                  <select-default
                    v-model="filter.with"
                    label="Dados Exibidos"
                    :items="displayWith"
                    :options="{
                      itemText: 'text',
                    }"
                  />
                </v-col>

                <v-col cols md="2">
                  <select-default
                    v-model="filter.orderBy"
                    label="Ordenar por"
                    placeholder="Ordenar por"
                    :items="filter.orderList"
                  />
                </v-col>

                <v-col cols md="2">
                  <select-default
                    v-model="filter.orderDirection"
                    label="Direção"
                    placeholder="Direção"
                    :items="filter.orderDirections"
                  />
                </v-col>

                <v-col cols>
                  <select-default
                    v-model="filter.perPage"
                    label="Registros"
                    placeholder="Total por pagina"
                    :items="[5, 10, 25, 100]"
                    @change="$emit('perPage', $event)"
                  />
                </v-col>
              </v-layout>

              <v-layout row class="mt-3">
                <slot name="filters" :filter="filter"> </slot>
              </v-layout>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn depressed color="error" @click="closeFilter(true)">
                Cancelar
              </v-btn>
              <v-btn
                color="primary"
                depressed
                @click="emitFilterSync(filter, true)"
              >
                <custom-icon>search</custom-icon>
                <span class="ml-1">Pesquisar</span>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-layout>
    </v-slide-y-transition>
  </v-col>
</template>

<script>
import { cloneDeep } from 'lodash'
import { mapGetters } from 'vuex'
export default {
  name: 'Breacrumb',

  props: {
    icon: {
      type: String,
      default: '',
    },

    title: {
      type: String,
      default: '',
    },

    menu: {
      type: Array,
      default: () => [],
    },

    hasFilter: {
      type: Boolean,
      default: false,
    },

    options: {
      type: Object,
      default: () => ({
        filter: {},
      }),
    },

    hasColumnFilter: {
      type: Boolean,
      default: false,
    },

    searchOptions: {
      type: Object,
      default: () => ({
        columns: [],
      }),
    },
  },

  data: () => ({
    showFilter: false,

    baseFilter: {
      model: false,
      menu: {},
      orderBy: 'id',
      orderDirection: 'desc',
      orderList: [],
      orderDirections: [
        { text: 'Crescente', value: 'asc' },
        { text: 'Decrescente', value: 'desc' },
      ],
      page: 1,
      perPage: 25,
      with: 'all',
      search: '',
      column: {},
    },

    filter: {},

    original: {},

    displayWith: [
      { text: 'Apenas Visíveis', value: 'all' },
      { text: 'Incluir Removidos', value: 'withTrashed' },
      { text: 'Apenas Removidos', value: 'onlyTrashed' },
    ],

    orderListDefault: [
      { text: 'ID', value: 'id' },
      { text: 'Data de Cadastro', value: 'created_at' },
      { text: 'Ultima Atualização', value: 'updated_at' },
    ],

    filterColumnDefault: [],
  }),

  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.smAndDown
    },

    filterHistory() {
      return cloneDeep({ ...this.$store.getters['context/filter'] })
    },

    hasFilterHistory() {
      return Object.entries(this.filterHistory).length > 0
    },

    ...mapGetters('account', ['isRoot', 'isAdmin']),
  },

  watch: {
    'filter.model'(current, old) {
      if (old && !current) {
        this.closeFilter()
      }
    },
  },

  methods: {
    emitFilterSync(value, history = false) {
      const filters = {
        orderBy: value.orderBy,
        orderDirection: value.orderDirection,
        page: value.page,
        perPage: value.perPage,
        with: value.with,
        search: value.search,
        column: value.column,
      }

      this.$emit('filter:sync', filters)

      if (history) {
        this.$store.commit('context/filterSync', cloneDeep({ ...filters }))
      }
    },

    closeFilter(clearHistory = false) {
      this.filter.model = false
      const original = { ...this.original }

      this.refreshFilter(original)
      this.emitFilterSync(original)

      this.$emit('filter:close', original)

      if (clearHistory) {
        this.$store.commit('context/filterReset')
      }
    },

    refreshFilter(value = {}) {
      this.filter = { ...this.baseFilter, ...this.options, ...value }

      if (this.filter.orderList.length === 0) {
        this.filter.orderList = [...this.orderListDefault]
      }

      for (let order of this.orderListDefault) {
        const index = this.filter.orderList.findIndex(
          (h) => h.value === order.value
        )

        if (index > -1) {
          continue
        }

        order.value === 'id'
          ? this.filter.orderList.unshift(order)
          : this.filter.orderList.push(order)
      }

      this.original = cloneDeep({ ...this.filter })
    },
  },

  created() {
    // this.refreshFilter(this.hasFilterHistory ? { ...this.filterHistory } : {})
    this.refreshFilter()
  },

  mounted() {
    this.emitFilterSync(this.filter)
  },
}
</script>

<style lang="scss">
.breadcrumb {
  > .v-toolbar__content {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
