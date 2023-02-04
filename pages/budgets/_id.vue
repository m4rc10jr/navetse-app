<template>
  <page>
    <template v-slot:header>
      <breadcrumb :title="title">
        <v-divider dark vertical class="mx-1"></v-divider>
        <!-- begin: pdf -->
        <print
          :data.sync="form"
          :complements="{
            entity: entities.find((h) => h.id === form.entity_id),
            employee: employees.find((h) => h.id === form.employee_id),
          }"
          v-if="!isNew && loaded"
          type="budget"
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
              @items="entities = $event"
              :api-options="{
                select: 'id,name',
                'where[type_id]': 1,
                limit: 50,
              }"
              :error-messages="watchErrorMessages('entity_id')"
            />
          </v-col>
        </v-row>

        <v-divider class="my-2"></v-divider>

        <editor-item
          :rows="[...form.items]"
          @input="syncItems"
          @valid="(valid) => (validItems = valid)"
          label="Detalhamento por Item"
          type="budget"
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
            <input-text label="Valor Bruto" :value="form.value | brl" />

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

            <input-text label="Valor Liquido" :value="form.liquid | brl" />
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
          :restore="!!form.inactive_at"
          v-if="!isNew"
          @completed="toggleDeleteComponent"
          form-action
        />

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
import { cloneDeep } from 'lodash'

export default {
  name: 'BudgetForm',

  layout: 'dashboard',

  mixins: [form],

  data: () => ({
    loaded: false,

    endpoint: '/api/budgets',

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

    entities: [],
    employees: [],

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
      return this.isNew ? 'Adicionar Orçamento' : 'Editar Orçamento'
    },

    notEdited() {
      return this.item.associate
    },
  },

  async fetch() {
    if (!this.isNew) {
      await this.load(this.$route.params.id, {
        'scope[withTrashed]': true,
        'employee[load]': true,
        limit: 1,
      })
    }

    this.loaded = true
  },

  methods: {
    // /**
    //  * Obtem informações da venda.
    //  *
    //  * @returns  {Promise<void>}
    //  */
    // async load() {
    //   const data = await this.$axios.$get(this.endpoint, {
    //     params: {
    //       'where[id]': this.$route.params.id,
    //       'scope[withTrashed]': true,
    //       'employee[load]': true,
    //       limit: 1,
    //     },
    //   })

    //   if (data.length <= 0) {
    //     this.$notify.error('Venda não foi encontrada...')
    //     this.$router.push('/sales')
    //     return
    //   }

    //   this.refresh(data[0])
    // },

    /**
     * Sincroniza items do formulário.
     *
     * @param {*} items
     */
    syncItems(items) {
      this.form.items = cloneDeep(items)
    },

    /**
     * Atualiza informações no formulário.
     *
     * @reuturns {void}
     */
    afterLoad(row) {
      const {
        entity: { id: entity_id },
        employee: { id: employee_id },
        date,
        ...payload
      } = row

      return {
        ...payload,
        entity_id,
        employee_id,
        date: this.$helper.formatDate(date, 'YYYY-MM-DD'),
      }
    },

    /**
     * Executado apos a atualizaçào/criação ser finalizada com sucesso.
     *
     * @param {*} form
     */
    afterSave(form, created = false) {
      // this.original = cloneDeep({ ...form })
      this.cancelled()
    },

    /**
     * Executado apos a atualizaçào/criação ser finalizada com sucesso.
     *
     * @param {*} form
     */
    cancelled() {
      this.$router.push('/budgets')
    },
  },

  middleware({ route, redirect }) {
    if (!route.params.id) {
      return redirect('/budgets')
    }
  },

  // async created() {
  //   if (!this.isNew) {
  //     await this.load()
  //   }

  //   this.reset()
  //   this.loaded = true

  //   this.$on('cancel', () => this.$router.push('/budgets'))
  // },
}
</script>

<style lang="scss">
.v-card__text {
  .v-toolbar__content {
    padding: 4px;
  }
}
</style>
