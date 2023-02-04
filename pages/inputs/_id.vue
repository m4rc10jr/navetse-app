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
          entity: providers.find((h) => h.id === form.provider_id),
          employee: {},
          account: orderByAccounts.find((h) => h.id === form.account_id),
        }"
        v-if="!isNew && loaded"
        type="input"
      />
      <!-- end: pdf -->
    </breadcrumb>

    <v-card v-if="loaded" :disabled="loading">
      <v-card-text>
        <row-info :row="item" v-if="!isNew" />

        <v-row>
          <v-col cols md="12">
            <v-card flat>
              <!-- <v-toolbar flat>
                <v-subheader class="pl-0">Dados Gerais</v-subheader>
              </v-toolbar> -->

              <v-card-text class="pt-0 px-0">
                <v-layout row class="mt-2">
                  <column md="3">
                    <input-date
                      v-model="$v.form.date.$model"
                      :error-messages="watchErrorMessages('date')"
                      label="Data da Operação"
                      @input="updateCompetenceDate"
                      default-date
                    />
                  </column>

                  <column md="3">
                    <select-dynamic
                      v-model.trim="$v.form.account_id.$model"
                      :error-messages="watchErrorMessages('account_id')"
                      @change="fetchSubAccounts"
                      label="Operação"
                      :item-text="(h) => h.title"
                      :data="orderByAccounts"
                      no-api-data
                      :select-options="{
                        hideDetails: true,
                      }"
                    />
                  </column>

                  <column md="6">
                    <select-dynamic
                      label="Envolvido"
                      v-model.trim="$v.form.provider_id.$model"
                      :error-messages="watchErrorMessages('provider_id')"
                      :item-text="(h) => h.name"
                      :data="providers"
                      no-api-data
                      resume-text
                      :select-options="{
                        hideDetails: true,
                        dense: true,
                      }"
                    />
                  </column>
                </v-layout>

                <v-layout row>
                  <column md="3">
                    <input-competence-date
                      v-model="$v.form.competence_date.$model"
                      :error-messages="watchErrorMessages('competence_date')"
                    />
                  </column>

                  <column md="3">
                    <select-dynamic
                      label="Departamento"
                      v-model.trim="$v.form.department_id.$model"
                      :error-messages="watchErrorMessages('department_id')"
                      :item-text="(h) => h.title"
                      :data="orderByDepartments"
                      no-api-data
                      :select-options="{
                        hideDetails: true,
                        dense: true,
                      }"
                    />
                  </column>
                  <column md="4" v-if="form.details.length">
                    <select-dynamic
                      label="Sub Conta"
                      :data="orderBySubAccounts"
                      no-api-data
                      :item-text="(h) => h.title"
                      v-model="form.details[0].sub_account_id"
                      @input="
                        $v.form.details.$each.$iter[0].sub_account_id.$touch
                      "
                      :error-messages="
                        watchErrorMessages(`details.0.sub_account_id`)
                      "
                    />
                  </column>

                  <column md="2" v-if="form.details.length">
                    <input-currency
                      label="Valor Liquido"
                      v-model="form.details[0].value"
                      @input="$v.form.details.$each.$iter[0].value.$touch"
                      :error-messages="watchErrorMessages(`details.0.value`)"
                    />
                  </column>
                </v-layout>

                <v-layout row class="mb-0">
                  <v-col md="12">
                    <v-textarea
                      label="Observações"
                      v-model.trim="$v.form.description.$model"
                      :error-messages="watchErrorMessages('description')"
                      outlined
                      hide-details
                      dense
                    />
                  </v-col>
                </v-layout>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- <v-col cols md="6">
            <v-card flat style="height: 100%">
              <v-toolbar flat>
                <v-subheader>Detalhamento</v-subheader>
                <v-spacer></v-spacer>
                <nav-items v-slot="{ mobile }">
                  <v-btn
                    :icon="mobile"
                    small
                    outlined
                    @click="addSubItem"
                    :disabled="onlyOneSubccount"
                  >
                    <custom-icon v-if="mobile">add</custom-icon>
                    <span v-else>Gerar +1</span>
                  </v-btn>

                  <v-btn
                    :icon="mobile"
                    small
                    outlined
                    @click="removeAllSubItems"
                  >
                    <custom-icon v-if="mobile">delete</custom-icon>
                    <span v-else>Remover Todos</span>
                  </v-btn>
                </nav-items>
              </v-toolbar>

              <v-card-text
                style="min-height: 310px; overflow: auto"
                class="pt-1 px-0"
              >
                <v-list class="pt-0">
                  <v-slide-y-transition group>
                    <v-list-item
                      v-for="(detail, index) in $v.form.details.$each.$iter"
                      :key="`input-detail-${index}`"
                    >
                      <div class="d-flex" :class="{ 'mt-3': index == 0 }">
                        <select-dynamic
                          label="Sub Conta"
                          :data="orderBySubAccounts"
                          no-api-data
                          :item-text="(h) => h.title"
                          v-model="detail.sub_account_id.$model"
                          :input-options="{
                            hideDetails: true,
                          }"
                          style="width: 300px"
                          :error-messages="
                            watchErrorMessages(
                              `details.${index}.sub_account_id`
                            )
                          "
                        />
                        <v-divider class="mx-1" dark></v-divider>
                        <input-currency
                          label="Valor Liquido"
                          v-model="detail.value.$model"
                          style="width: 150px"
                          :error-messages="
                            watchErrorMessages(`details.${index}.value`)
                          "
                        />
                        <v-divider class="mx-1" dark></v-divider>
                        <v-btn
                          icon
                          small
                          style="margin-top: 6px"
                          @click.stop="removeSubItem(detail.$model, index)"
                        >
                          <custom-icon>delete</custom-icon>
                        </v-btn>
                      </div>
                    </v-list-item>
                  </v-slide-y-transition>

                  <v-slide-y-transition mode="out-in">
                    <v-list-item v-if="details.length <= 0" key="empty">
                      <v-list-item-content>
                        <v-alert type="info" outlined class="pa-1">
                          Nenhuma sub conta foi vinculada ao lançamento!
                        </v-alert>
                      </v-list-item-content>
                    </v-list-item>
                  </v-slide-y-transition>
                </v-list>
              </v-card-text>

              <v-card-actions style="position: absolute; bottom: 20px">
                <v-text-field
                  label="Valor Liquido Total"
                  :value="totalLiquid | brl"
                  outlined
                  disabled
                  hide-details
                  dense
                  style="max-width: 180px"
                />
              </v-card-actions>
            </v-card>
          </v-col> -->
        </v-row>

        <v-divider class="py-1"></v-divider>
        <uploader-gallery :items="form.attachments" @send="prepareFiles" />

        <v-divider></v-divider>

        <editor-installment
          :total.sync="totalLiquid"
          :rows.sync="form.installments"
          @input="syncInstallments"
          @valid="(valid) => (validInstallments = valid)"
          :pay-by-check="isOutputAccount"
        />
      </v-card-text>

      <v-card-actions class="mt-2">
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
import { gte } from '~/plugins/rules'
import { required } from 'vuelidate/lib/validators'
import { cloneDeep, sortBy } from 'lodash'
import { mapGetters } from 'vuex'
import FormLowInstallment from './components/FormLowInstallment'
export default {
  components: { FormLowInstallment },
  name: 'InputForm',

  layout: 'dashboard',

  mixins: [form],

  data: () => ({
    loaded: false,

    endpoint: '/api/inputs',

    components: {
      FormLowInstallment,
    },

    base: {
      id: null,
      date: null,
      competence_date: '2022-07-01',
      department_id: null,
      provider_id: null,
      account_id: null,
      description: null,
      installments: [],
      details: [],
      attachments: [],
    },

    detailBase: {
      id: null,
      ref: null,
      sub_account_id: null,
      value: 0,
    },

    form: {
      details: [],
      installments: [],
      attachments: [],
      account_id: null,
    },

    rules: {
      id: {},
    },

    validInstallments: false,

    subAccounts: [],
    providers: [],
  }),

  validations: {
    form: {
      date: { required },
      competence_date: { required },
      account_id: { required },
      department_id: { required },
      provider_id: { required },
      description: {},
      details: {
        $each: {
          sub_account_id: { required },
          value: { required, gte: gte(0.01) },
        },
      },
    },
  },

  computed: {
    title() {
      return this.isNew ? 'Novo Lançamento' : 'Editar Lançamento'
    },

    loading() {
      return this.$store.getters['request/loading']
    },

    isValid() {
      return this.validInstallments
    },

    totalLiquid() {
      return this.form.details.reduce((a, b) => a + b.value, 0)
    },

    months() {
      return this.$helper.monthGenerator()
    },

    orderByDepartments() {
      return sortBy([...this.departments], 'title')
    },

    orderByAccounts() {
      return sortBy([...this.accounts], 'title') ?? []
    },

    orderBySubAccounts() {
      return sortBy([...this.subAccounts], 'title') ?? []
    },

    isOutputAccount() {
      if (!this.form.account_id) return false

      const account = this.orderByAccounts.find(
        (h) => h.id === this.form.account_id
      )

      return account?.type === 'output'
    },

    onlyOneSubccount() {
      return this.form.details.length === 1
    },

    details() {
      return this.form.details ?? []
    },

    ...mapGetters({
      accounts: 'resources/accounts',
      departments: 'resources/departments',
      mainCompany: 'account/companyInUse',
    }),
  },

  async fetch() {
    let resolve = [
      this.fetchDepartments(),
      this.fetchAccounts(),
      this.fetchProviders(),
    ]

    await Promise.all(resolve)

    if (!this.isNew) {
      await this.load(this.$route.params.id, {
        'scope[withTrashed]': true,
        installments: true,
        attachments: true,
        limit: 1,
      })
    }

    if (this.mainCompany?.options && this.isNew) {
      this.form.department_id = this.mainCompany.options?.department_id
      this.form.provider_id = this.mainCompany.options?.entity_id
      this.$forceUpdate()
    }

    this.loaded = true
  },

  methods: {
    /**
     * Atualiza informações no formulário.
     *
     * @reuturns {Promise<void>}
     */
    afterLoad(row) {
      const { account, department, provider, installments, details, ...data } =
        row

      const item = {
        account_id: account?.id,
        department_id: department?.id,
        provider_id: provider?.id,
        installments: cloneDeep(installments),
        details: cloneDeep(details),
        ...data,
      }

      this.$bus.$emit('editor:installment:sync', item.installments)

      this.fetchSubAccounts({ id: row.account.id })

      return item
    },

    /**
     * @param {*} value
     */
    updateCompetenceDate(value) {
      if (!value) return

      this.form.competence_date = this.$helper
        .moment(value)
        .format('YYYY-MM-DD')
      this.$v.form.competence_date.$touch()
    },

    /**
     * Executado antes de submeter o formulario.
     *
     * @param {*} form
     */
    beforeSave(form) {
      form.total_value = form.details.reduce((a, b) => a + b.value, 0)

      form.installments = form.installments.map((installment) => {
        installment.type_payment_id =
          installment?.type_payment_id ?? installment.type?.id

        installment.payments = installment.payments.map((payment) => {
          payment.type_payment_id = payment?.type_payment_id ?? payment.type?.id

          return payment
        })

        return installment
      })

      if (!this.isNew) {
        delete form.attachments
      }

      return this.isNew ? this.prepareFormData(form) : form
    },

    /**
     * Sincronizar parcelas.
     *
     * @param {*} items
     */
    syncInstallments(items) {
      const data = cloneDeep(items)

      this.form.installments = data
    },

    /**
     * Carregar tipos de pagamento.
     *
     * @returns {void}
     */
    async fetchDepartments() {
      await this.$store.dispatch('resources/fetch', {
        resource: 'department',
        force: true,
      })
    },

    /**
     * Carregar tipos de pagamento.
     *
     * @returns {Promise<void>}
     */
    async fetchSubAccounts(item) {
      this.form.details = []

      const data = await this.$axios.$get('/api/sub-accounts', {
        params: {
          select: 'id,title,group',
          'where[account_id]': item?.id ?? this.form.account_id,
        },
      })

      this.addSubItem()

      this.subAccounts = [...data]
    },

    /**
     * Carregar entidades do tipo "fornecedor".
     *
     * @returns {void}
     */
    async fetchProviders() {
      const data = await this.$axios.$get('/api/entities', {
        params: {
          select: 'id,name',
        },
      })

      this.providers = [...data]
    },

    /**
     * Carregar tipos de pagamento.
     *
     * @returns {void}
     */
    async fetchAccounts() {
      await this.$store.dispatch('resources/fetch', {
        resource: 'account',
      })
    },

    /**
     * Adiciona item.
     *
     * @returns {void}
     */
    addSubItem() {
      if (this.form.details.length >= 1) return

      this.form.details.push({ ...this.detailBase })
    },

    /**
     * Remove item.
     *
     * @param {*} item
     * @param {*} index
     */
    removeSubItem(item, index) {
      if (!confirm('Tem certeza?')) {
        return
      }

      this.form.details.splice(index, 1)
    },

    /**
     * Remove todos items.
     *
     * @returns {void}
     */
    removeAllSubItems() {
      if (!confirm('Tem certeza?')) {
        return
      }

      this.form.details = []
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
     * Executado apos a atualizaçào/criação ser finalizada com sucesso.
     *
     * @param {*} form
     */
    cancelled() {
      this.$router.push('/inputs')
    },

    /**
     * @param {*} files
     */
    prepareFiles(files) {
      this.form.attachments = files
      this.$forceUpdate()
    },
  },

  middleware({ route, redirect }) {
    if (!route.params.id) {
      return redirect('/inputs')
    }
  },

  beforeDestroy() {
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
</style>
