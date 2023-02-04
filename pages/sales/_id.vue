<template>
  <page>
    <breadcrumb :title="title" slot="header">
      <form-low-installment
        :amount.sync="totalLiquid"
        :installments.sync="form.installments"
        @save="save(form)"
        v-if="!isNew && loaded"
      />
      <v-divider dark vertical class="mx-1"></v-divider>
      <!-- begin: pdf -->
      <print
        :data.sync="form"
        :complements="{
          entity: entities.find((h) => h.id === form.entity_id),
          employee: employees.find((h) => h.id === form.employee_id),
        }"
        v-if="!isNew && loaded"
        type="sale"
      />
      <!-- end: pdf -->
    </breadcrumb>

    <v-card v-if="loaded" :disabled="loading">
      <v-card-text>
        <row-info :row="item" v-if="!isNew" />

        <v-row class="mt-4" :class="{ mobile: $vuetify.breakpoint.smAndDown }">
          <v-col cols md="3">
            <input-date
              label="Data da Operação"
              v-model.trim="$v.form.date.$model"
              :error-messages="watchErrorMessages('date')"
            />
          </v-col>

          <v-col cols md="3">
            <select-employee
              v-model="$v.form.employee_id.$model"
              :error-messages="watchErrorMessages('employee_id')"
              @items="employees = $event"
            />
          </v-col>

          <v-col cols md="6">
            <select-dynamic
              label="Cliente"
              endpoint="/api/entities"
              item-text="name"
              v-model="$v.form.entity_id.$model"
              :api-options="{
                select: 'id,name',
                'where[type_id]': 1,
                limit: 50,
              }"
              :error-messages="watchErrorMessages('entity_id')"
              @change="onSelectClient"
              :data="entities"
              :select-options="{ hideDetails: true, dense: true }"
            />
          </v-col>

          <v-col cols md="3">
            <select-dynamic
              :item-text="
                (h) =>
                  `${h.code ? h.code : h.id} - ${$helper.formatDate(
                    h.date,
                    'DD/MM/YYYY'
                  )}`
              "
              no-api-data
              label="Ordem de Produção"
              :data="productionOrders"
              :loading="infoLoading"
              v-model="$v.form.production_order_id.$model"
              :error-messages="watchErrorMessages('production_order_id')"
              :select-options="{ hideDetails: true, dense: true }"
            />
          </v-col>

          <v-col cols md="3">
            <select-dynamic
              :item-text="(h) => String(h.id).trim()"
              no-api-data
              label="Orçamento"
              :data="budgets"
              :loading="infoLoading"
              v-model="$v.form.budget_id.$model"
              :error-messages="watchErrorMessages('budget_id')"
              @change="selectBudget"
              :select-options="{ hideDetails: true, dense: true }"
            />
          </v-col>

          <v-col cols class="pt-0" md="1">
            <v-switch
              label="Detalhar por item?"
              hide-details
              class="switch-label-column mt-0"
              v-model="hasItems"
              dense
              @change="checkFormItems"
            />
          </v-col>
        </v-row>

        <v-slide-y-transition>
          <editor-item
            :rows="[...form.items]"
            @input="syncItems"
            @valid="(valid) => (validItems = valid)"
            label="Detalhamento por Item"
            key="editor-items"
            has-sale
            type="sale"
            v-if="hasItems"
          />
        </v-slide-y-transition>

        <v-divider class="mt-2"></v-divider>

        <v-toolbar color="transparent" flat>
          <v-toolbar-title class="subtitle-1">Total Geral</v-toolbar-title>
        </v-toolbar>

        <v-row class="mt-2" :class="{ mobile: $vuetify.breakpoint.xs }">
          <column
            :full="$vuetify.breakpoint.smAndDown"
            md="6"
            :class="{ 'd-flex justify-space-between': !$vuetify.breakpoint.xs }"
          >
            <input-currency
              label="Valor Bruto"
              v-model="form.value"
              :disabled="hasItems"
              :errorMessages="watchErrorMessages('value')"
              @input="$v.form.value.$touch"
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

            <input-text label="Valor Liquido" :value="totalLiquid | brl" />
          </column>

          <column full>
            <v-textarea
              label="Observações"
              outlined
              dense
              v-model.trim="$v.form.description.$model"
            />
          </column>
        </v-row>

        <v-divider class="py-1"></v-divider>

        <editor-installment
          :total.sync="totalLiquid"
          :rows="[...form.installments]"
          @input="syncInstallments"
          @valid="(valid) => (validInstallments = valid)"
          has-sale
        />
      </v-card-text>

      <v-card-actions>
        <button-delete
          :endpoint="endpoint"
          :id="form.id"
          v-if="!isNew"
          form-action
          :restore="!!form.inactive_at"
          @completed="toggleDeleteComponent"
        />

        <v-spacer></v-spacer>

        <v-btn outlined @click="cancel">Cancelar</v-btn>

        <v-btn
          color="primary"
          :loading="loading"
          depressed
          :disabled="!isValid"
          @click="save(form)"
          >Salvar</v-btn
        >
      </v-card-actions>
    </v-card>
  </page>
</template>

<script>
import form from '~/mixins/form-component'
import { required, requiredIf } from 'vuelidate/lib/validators'
import { cloneDeep } from 'lodash'
import { gt } from '~/plugins/rules'
import { mapGetters } from 'vuex'
import FormLowInstallment from '../inputs/components/FormLowInstallment'

export default {
  name: 'SaleForm',

  layout: 'dashboard',

  mixins: [form],

  components: {
    FormLowInstallment,
  },

  data: () => ({
    endpoint: '/api/sales',

    loaded: false,
    hasItems: false,
    infoLoading: false,
    validItems: false,
    validInstallments: false,

    base: {
      date: null,
      entity_id: null,
      employee_id: null,
      budget_id: null,
      production_order_id: null,
      discount: 0,
      addition: 0,
      value: 0,
      liquid: 0,
      description: '',
      items: [],
      installments: [],
      inactive_at: null,
    },

    form: {
      items: [],
      installments: [],
    },

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
      budget_id: {},
      production_order_id: {},
      description: {},
      addition: {},
      discount: {},
      value: {
        required: requiredIf((vm) => vm.items.length <= 0),
        gt: gt(0),
      },
      liquid: {},
    },

    budgets: [],
    productionOrders: [],
    entities: [],
    employees: [],
    hasItemsLoading: false,
  }),

  computed: {
    title() {
      return this.isNew ? 'Adicionar Venda' : 'Editar Venda'
    },

    loading() {
      return this.$store.getters['request/loading']
    },

    isValid() {
      return this.isValidItems && this.isValidInstallments
    },

    isValidItems() {
      return this.form.items.length === 0 || this.validItems
    },

    isValidInstallments() {
      return this.form.installments.length === 0 || this.validInstallments
    },

    totalLiquid() {
      return this.form.value - this.form.discount + this.form.addition
    },

    ...mapGetters('account', {
      mainCompany: 'companyInUse',
    }),
  },

  async fetch() {
    if (!this.isNew) {
      await this.load(this.$route.params.id, {
        'scope[withTrashed]': true,
        'budget[load]': true,
        'budget[select]': 'id,code,date',
        'productionOrder[load]': true,
        'productionOrder[select]': 'id,code,date',
        installments: true,
        limit: 1,
      })
    }

    if (this.mainCompany?.options?.entity_id && this.isNew) {
      this.form.entity_id = this.mainCompany?.options?.entity_id
      this.$forceUpdate()
    }

    this.loaded = true
  },

  methods: {
    /**
     * Carregar orçamento e ordem de produção do cliente
     *
     * @returns {Promise<void>}
     */
    onSelectClient(event) {
      if (!event?.id) {
        return
      }

      const request = [
        this.fetchData('budgets', event.id, {
          select: 'id,code',
        }),
        this.fetchData('production-orders', event.id, {
          select: 'id,code',
        }),
      ]

      Promise.all(request).then(() => {
        this.form.budget_id = null
        this.form.production_order_id = null
      })
    },

    /**
     * Verificar formulario antes do envio.
     *
     * @param {*} form
     */
    beforeSave(form) {
      const { installments } = form

      form.value = Number(form.value)
      form.installments = installments.map((installment) => {
        installment.type_payment_id =
          installment?.type?.id ?? installment?.type_payment_id

        const { payments } = installment

        installment.payments = payments.map((payment) => {
          payment.type_payment_id =
            payment?.type?.id ?? payment?.type_payment_id
          return payment
        })

        return installment
      })

      return form
    },

    /**
     * Atualiza informações no formulário.
     *
     * @reuturns {void}
     */
    afterLoad(row) {
      const { entity = {}, employee = {} } = row

      const { date, items, installments, ...payload } = row

      const item = {
        ...payload,
        budget_id: row.budget?.id,
        production_order_id: row.production_order?.id,
        entity_id: entity?.id,
        employee_id: employee?.id,
        date: this.$helper.formatDate(date, 'YYYY-MM-DD'),
        installments,
        items: cloneDeep(items),
      }

      this.entities = [{ id: entity.id, name: entity.name }]

      if (row.budget?.id) {
        const { budget } = row

        this.budgets = [{ id: budget.id, code: budget.code, date: budget.date }]
      }

      if (row.production_order?.id) {
        const { production_order } = row

        this.productionOrders = [
          {
            id: production_order.id,
            code: production_order.code,
            date: production_order.date,
          },
        ]
      }

      this.hasItems = item.items.length > 0

      return item
    },

    /**
     * Obtem orçamento do cliente.
     *
     * @param {*} entity_id
     * @returns {Promise<void>}
     */
    async fetchData(resource = 'budgets', entity_id = null, _params = {}) {
      let params = {
        'orderBy[id]': 'asc',
        limit: 1,
        ..._params,
      }

      entity_id && (params['where[entity_id]'] = entity_id)

      const data = await this.$axios.$get(`/api/${resource}`, {
        params,
      })

      const map = {
        'production-orders': () => 'productionOrders',
        default: () => resource,
      }

      this[(map[resource] || map.default)()] = data
    },

    /**
     * Sincroniza items do formulário.
     *
     * @param {*} items
     */
    syncItems(items) {
      this.form.value = items.reduce((a, b) => a + b.total, 0)
      this.form.items = cloneDeep(items)
    },

    /**
     * Sincronizar parcelas.
     *
     * @param {*} items
     */
    syncInstallments(items) {
      this.form.installments = cloneDeep(items)
    },

    /**
     * Carregar orçamento do cliente.
     *
     * @param {*} budget
     */
    async selectBudget(budget) {
      const response = await this.$axios.$get(
        `/api/budgets?where[id]=${budget.id}&limit=1`
      )

      if (response.length <= 0) {
        this.$notify.error('Orçamento não foi carregado corretamente.')
        return
      }

      const data = response[0]

      Object.assign(data, {
        budget: {
          id: data.id,
          code: data.code,
        },
        installments: [],
      })

      delete data.id
      delete data.code

      this.refresh(data)

      this.$bus.$emit('editor:item:sync', [...data.items])
    },

    /**
     * @param {*} value
     */
    checkFormItems(value) {
      if (
        !value &&
        this.form.items.length > 0 &&
        !confirm(
          'Tem certeza? ao desativar os items configurados serão reiniciados.'
        )
      ) {
        return setTimeout(() => {
          this.hasItems = true
        }, 1)
      }

      this.form.items = []
      this.$bus.$emit('editor:item:sync', [])
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
      this.$router.push('/sales')
    },
  },

  middleware({ route, redirect }) {
    if (!route.params.id) {
      return redirect('/sales')
    }
  },

  beforeDestroy() {
    this.$bus.$off('editor:item:sync')
    this.$bus.$off('editor:installment:sync')
  },
}
</script>

<style lang="scss">
.v-card__text {
  .v-toolbar__content {
    padding: 4px;
  }
}

.switch-label-column .v-input__slot .v-label {
  width: 200px;
}
</style>
