<template>
  <page>
    <template v-slot:header>
      <breadcrumb :title="title">
        <v-divider dark vertical class="mx-1"></v-divider>
        <!-- begin: pdf -->
        <print
          :data.sync="form"
          :complements="{
            employee: employees.find((h) => h.id === form.employee_id),
            entity: entities.find((h) => h.id === form.entity_id),
          }"
          v-if="!isNew && loaded"
          type="production-order"
        />
        <!-- end: pdf -->
      </breadcrumb>
    </template>

    <v-card v-if="loaded">
      <v-card-text>
        <row-info :row="item" v-if="!isNew" />

        <v-row class="mt-4" :class="{ mobile: $vuetify.breakpoint.smAndDown }">
          <v-col md="2">
            <input-date
              label="Data da Operação"
              v-model.trim="$v.form.date.$model"
              :error-messages="watchErrorMessages('date')"
            />
          </v-col>

          <v-col md="5">
            <select-employee
              v-model="$v.form.employee_id.$model"
              :error-messages="watchErrorMessages('employee_id')"
              @items="employees = $event"
            />
          </v-col>

          <v-col md="5">
            <select-dynamic
              label="Cliente"
              endpoint="/api/entities"
              item-text="name"
              v-model="$v.form.entity_id.$model"
              :api-options="{ select: 'id,name', 'where[type_id]': 1 }"
              :error-messages="watchErrorMessages('entity_id')"
              @items="entities = $event"
            />
          </v-col>
        </v-row>

        <v-divider class="my-2"></v-divider>

        <editor-item
          :rows="[...form.items]"
          @input="syncItems"
          @valid="(valid) => (validItems = valid)"
          label="Detalhamento por Item"
          type="production_order"
        />

        <v-divider class="py-1"></v-divider>

        <v-toolbar color="transparent" flat>
          <v-toolbar-title class="subtitle-1">Total Geral</v-toolbar-title>
        </v-toolbar>

        <v-row class="mt-2" :class="{ mobile: $vuetify.breakpoint.xs }">
          <column
            :full="$vuetify.breakpoint.smAndDown"
            md="6"
            :class="{ 'd-flex justify-space-between': !$vuetify.breakpoint.xs }"
          >
            <input-text
              label="Valor Bruto"
              :value="totalBrute | brl"
              disabled
            />

            <v-divider
              class="mx-1"
              :class="{ 'mb-5': $vuetify.breakpoint.xs }"
              dark
            />

            <input-currency
              label="Descontos"
              v-model="$v.form.discount.$model"
            />

            <v-divider
              class="mx-1"
              :class="{ 'my-3': $vuetify.breakpoint.xs }"
              dark
            />

            <input-currency
              label="Acrescimos"
              v-model="$v.form.addition.$model"
            />

            <v-divider
              class="mx-1"
              :class="{ 'my-3': $vuetify.breakpoint.xs }"
              dark
            />

            <input-text
              label="Valor Liquido"
              :value="totalLiquid | brl"
              disabled
            />
          </column>

          <column full>
            <v-textarea
              label="Observações"
              outlined
              v-model.trim="$v.form.description.$model"
            />
          </column>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <button-delete
          :endpoint="endpoint"
          :id="form.id"
          v-if="!isNew"
          @completed="toggleDeleteComponent"
          form-action
        ></button-delete>

        <v-spacer></v-spacer>
        <v-btn outlined @click="cancel">Cancelar</v-btn>
        <v-btn
          color="primary"
          :loading="$store.getters['request/loading']"
          depressed
          :disabled="!validItems"
          @click="save(form)"
          >Salvar</v-btn
        >
      </v-card-actions>
    </v-card>
  </page>
</template>

<script>
import form from '~/mixins/form-component'
import { required } from 'vuelidate/lib/validators'
import { cloneDeep, sumBy } from 'lodash'

export default {
  name: 'BudgetForm',

  layout: 'dashboard',

  mixins: [form],

  data: () => ({
    loaded: false,

    endpoint: '/api/production-orders',

    base: {
      date: null,
      entity_id: null,
      employee_id: null,
      discount: 0,
      addition: 0,
      value: 0,
      liquid: 0,
      description: '',
      items: [],
    },

    form: {
      items: [],
    },

    employees: [],
    entities: [],

    rules: {
      date: {
        required,
      },
      entity_id: {
        required,
      },
      employee_id: {
        required,
      },
      description: {},
      addition: {},
      discount: {},
      value: {},
      liquid: {},
    },

    infoLoading: false,
    validItems: false,
    budgets: [],

    productionOrders: [],
  }),

  watch: {
    form: {
      deep: true,
      handler(value) {
        value.value = value.items.reduce((a, b) => a + b.total, 0)
        value.liquid = value.value - value.discount + value.addition
      },
    },
  },

  computed: {
    title() {
      return this.isNew
        ? 'Adicionar Ordem de Produção'
        : 'Editar Ordem de Produção'
    },

    totalBrute() {
      return sumBy(this.form.items, (h) => h.total)
    },

    totalLiquid() {
      return this.totalBrute - this.form.discount + this.form.addition
    },
  },

  async fetch() {
    if (!this.isNew) {
      await this.load(this.$route.params.id, {
        'where[id]': this.$route.params.id,
        'scope[withTrashed]': true,
        'employee[load]': true,
        limit: 1,
      })
    }

    this.loaded = true
  },

  methods: {
    /**
     * Atualiza informações no formulário.
     *
     * @reuturns {void}
     */
    afterLoad(row) {
      const { id: entity_id } = row.entity
      const { id: employee_id } = row.employee

      const { date, ...payload } = row

      return {
        ...payload,
        entity_id,
        employee_id,
        date: this.$helper.formatDate(date, 'YYYY-MM-DD'),
      }
    },

    /**
     * Sincroniza items do formulário.
     *
     * @param {*} items
     */
    syncItems(items) {
      this.form.items = cloneDeep(items)
    },

    /**
     * Executado apos a atualizaçào/criação ser finalizada com sucesso.
     *
     * @param {*} form
     */
    afterSave(form, created = false) {
      this.cancelled()
    },

    /**
     * Executado apos ser cancelado
     *
     * @param {*} form
     */
    cancelled() {
      this.$router.push('/production-orders')
    },
  },

  middleware({ route, redirect }) {
    if (!route.params.id) {
      return redirect('/production-orders')
    }
  },
}
</script>

<style lang="scss">
.v-card__text {
  .v-toolbar__content {
    padding: 4px;
  }
}
</style>
