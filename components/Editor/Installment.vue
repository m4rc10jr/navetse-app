<template>
  <v-card flat>
    <v-toolbar dense flat>
      <v-toolbar-title style="font-size: 16px"
        >Parcelas ({{ form.length }})</v-toolbar-title
      >
      <v-spacer></v-spacer>

      <nav-items v-slot="{ mobile }">
        <v-btn
          :icon="mobile"
          small
          outlined
          @click="add"
          :disabled="getTotalAvailable <= 0"
        >
          <custom-icon v-if="mobile">add</custom-icon>
          <span v-else>Gerar +1</span>
        </v-btn>
        <v-btn :icon="mobile" small outlined @click="removeAll">
          <custom-icon v-if="mobile">delete</custom-icon>
          <span v-else>Remover Todos</span>
        </v-btn>
      </nav-items>
    </v-toolbar>

    <v-list two-line class="editor-installment">
      <v-list-item-group v-model="selected" active-class="actived">
        <v-slide-y-transition group>
          <v-list-item
            class="px-0"
            v-for="(item, index) in orderRecords"
            :key="index"
            @click="edit(item, index)"
            :class="{
              invalid: $v.form.$each.$iter[index].$invalid,
              'mt-2': index > 0,
            }"
          >
            <v-list-item-action>
              <div class="ml-1">
                <v-slide-x-reverse-transition mode="in-out">
                  <custom-icon
                    style="color: red"
                    v-if="$v.form.$each.$iter[index].$invalid"
                    :key="`error.{index}`"
                    >error</custom-icon
                  >
                  <custom-icon v-else :key="`done.${index}`">paid</custom-icon>
                </v-slide-x-reverse-transition>
              </div>
            </v-list-item-action>

            <v-list-item-content>
              <v-list-item-title>
                <span
                  >Parcela <b>#{{ item.installment_number }}</b> via
                  <b>{{ getPaymentType(item.type_payment_id).text }}</b></span
                >
              </v-list-item-title>
              <v-list-item-subtitle class="mt-1">
                <span>Valor: </span>
                <b>{{ item.value | brl }}</b> ({{ getTypeTitle(item.type_id) }})
              </v-list-item-subtitle>
              <v-list-item-subtitle class="mt-1">
                <span>Status: </span>
                <b>{{ item.status || '...' }}</b>
              </v-list-item-subtitle>
              <v-list-item-subtitle class="mt-1">
                <span>Data de Recebimento:</span>
                <b>{{ item.receipt_date | formatDate('DD/MM/YYYY') }}</b>
              </v-list-item-subtitle>

              <v-list-item-subtitle
                v-if="draft.includes(item.ref)"
                class="mt-1"
              >
                <small>* você tem edições não salvas nesse item.</small>
              </v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action>
              <v-layout row class="mr-1">
                <v-btn icon @click.stop="remove(item, index)" class="mr-0">
                  <custom-icon>delete</custom-icon>
                </v-btn>
              </v-layout>
            </v-list-item-action>
          </v-list-item>
        </v-slide-y-transition>
      </v-list-item-group>

      <v-list-item key="empty" class="pl-0" v-if="form.length === 0">
        <v-list-item-content>
          <alert type="info" :options="{ outlined: true }">
            Nenhuma parcela registrada para
            {{ hasSale ? 'esta venda' : 'este lançamento' }}
          </alert>
        </v-list-item-content>
      </v-list-item>

      <!-- BEGIN: installment -->
      <modal v-if="dialog" v-model="dialog" width="75vw" @close="closeDialog">
        <v-toolbar-title slot="header"
          >Parcela #{{ model.installment_number }}</v-toolbar-title
        >
        <v-sheet flat color="transparent">
          <v-card flat>
            <v-card-text class="pt-0">
              <v-subheader>Detalhes Gerais</v-subheader>
              <!-- begin: parcelas -->
              <v-layout row class="mt-1">
                <column md="4">
                  <input-text
                    disabled
                    label="ID"
                    :value="model.id || model.ref || '--'"
                  />
                </column>

                <column md="4">
                  <input-currency
                    label="Valor Liquido"
                    v-model="input.value.$model"
                    :error-messages="
                      watchErrorMessages(`self.${currentIndexOf}.value`, null, {
                        lte: () =>
                          $helper.currency.brl(
                            this.prevInstallmentValue(model)
                          ),
                      })
                    "
                    :ref="`installment_value_${model.ref}`"
                  />
                </column>

                <column md="4">
                  <input-date
                    label="Previsão Recebimento"
                    v-model="input.receipt_date.$model"
                    :error-messages="
                      watchErrorMessages(`self.${currentIndexOf}.receipt_date`)
                    "
                  />
                </column>
              </v-layout>

              <v-layout row>
                <column md="4">
                  <v-select
                    :items="types"
                    v-model="input.type_id.$model"
                    label="Tipo de Baixa"
                    outlined
                    hide-details
                    dense
                    :error-messages="
                      watchErrorMessages(`self.${currentIndexOf}.type_id`)
                    "
                    @change="updateType"
                  />
                </column>

                <column md="4">
                  <v-select
                    :disabled="input.type_id.$invalid"
                    :items="filterPaymentByType(input.$model.type_id)"
                    v-model="input.type_payment_id.$model"
                    :error-messages="
                      watchErrorMessages(
                        `self.${currentIndexOf}.type_payment_id`
                      )
                    "
                    label="Pagamento via"
                    outlined
                    hide-details
                    dense
                    @change="updatePaymentType"
                  />
                </column>

                <column md="4">
                  <input-text
                    label="Doc/Referencia"
                    v-model.trim="input.code.$model"
                    :error-messages="
                      watchErrorMessages(`self.${currentIndexOf}.code`)
                    "
                  />
                </column>
              </v-layout>
              <!-- end: parcelas -->

              <v-divider style="margin-top: 1rem; margin-bottom: 0"></v-divider>

              <!-- begin: pagamentos -->
              <v-subheader class="pl-0"
                >Baixa de Pagamentos/Recebimentos</v-subheader
              >
              <v-slide-y-transition group>
                <v-layout
                  row
                  v-for="(payment, index) in input.payments.$each.$iter"
                  :key="`${model.id}_payment_${index}`"
                  :class="{ 'mt-4': index == 0 }"
                >
                  <column width="168px">
                    <input-currency
                      v-model="payment.value.$model"
                      :label="`Valor liquido`"
                      :error-messages="
                        watchErrorMessages(
                          `self.${currentIndexOf}.payments.${index}.value`,
                          'valor',
                          {
                            lte: () => $helper.currency.brl(model.value),
                          }
                        )
                      "
                      :inputOptions="{
                        'hide-details': true,
                      }"
                    />
                  </column>

                  <column width="200px">
                    <input-date
                      v-model.trim="payment.payment_date.$model"
                      label="Data de Recebimento"
                      :error-messages="
                        watchErrorMessages(
                          `self.${currentIndexOf}.payments.${index}.payment_date`
                        )
                      "
                    />
                  </column>

                  <column width="240px">
                    <v-select
                      :items="paymentTypes"
                      v-model="payment.type_payment_id.$model"
                      :error-messages="
                        watchErrorMessages(
                          `self.${currentIndexOf}.payments.${index}.type_payment_id`
                        )
                      "
                      label="Tipo de Recebimento"
                      outlined
                      dense
                      hide-details
                    />
                  </column>

                  <column
                    width="280px"
                    v-if="!hasSale && payment.type_payment_id.$model == 9"
                  >
                    <input-doc
                      label="Doc/Referencia"
                      v-model="payment.$model.code"
                      @input="payment.code.$touch"
                      :error-messages="
                        watchErrorMessages(
                          `self.${currentIndexOf}.payments.${index}.code`
                        )
                      "
                      :item="{ id: null, code: payment.$model.code }"
                    />
                  </column>

                  <column class="px-0" width="84px">
                    <v-btn
                      depressed
                      icon
                      @click="removePayment(input, payment, index)"
                    >
                      <custom-icon>delete</custom-icon>
                    </v-btn>

                    <v-btn
                      depressed
                      icon
                      :disabled="payment.$model.value >= input.$model.value"
                      @click="addPayment(input, input.$model.value, index)"
                    >
                      <custom-icon>add</custom-icon>
                    </v-btn>
                  </column>
                </v-layout>
              </v-slide-y-transition>

              <alert v-if="model.payments.length <= 0">
                Nenhum pagamento foi gerado para essa parcela,
                <a href="#" @click.stop="addPayment(input, getTotalAvailable)"
                  >clique aqui</a
                >
                se deseja inserir um novo pagamento.
              </alert>
              <!-- end: pagamentos -->
            </v-card-text>
          </v-card>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn depressed @click="reset(input)"> Cancelar </v-btn>
            <v-btn color="primary" depressed @click="createOrUpdate(input)">
              Salvar
            </v-btn>
          </v-card-actions>
        </v-sheet>
      </modal>
    </v-list>
  </v-card>
</template>

<script>
import validate from '~/mixins/validate'
import { required, requiredIf } from 'vuelidate/lib/validators'
import { gt, lte } from '~/plugins/rules'
import dialog from '~/mixins/dialog'
import { cloneDeep, omitBy, sumBy, uniqueId } from 'lodash'
import moment from 'moment'
import InputDoc from './components/InputDoc.vue'

export default {
  name: 'EditorInstallment',

  mixins: [validate, dialog],

  components: {
    InputDoc,
  },

  props: {
    rows: {
      type: Array,
      default: () => [],
    },

    total: {
      required: true,
      type: Number,
      default: 0,
    },

    hasSale: {
      type: Boolean,
      default: false,
    },

    payByCheck: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    selected: null,

    activeTab: 0,

    base: {
      id: null,
      installment_number: 0,
      receipt_date: null,
      type_payment_id: null,
      value: 0,
      code: null,
      type_id: null,
      ref: null,
      status: null,
      payments: [],
    },

    form: [],

    editorForm: {},

    currentIndexOf: -1,

    newRecords: [],

    types: [
      { text: 'A Vista', value: 1 },
      { text: 'A Prazo', value: 0 },
    ],

    paymentTypes: [],

    draft: [],

    rowsMultable: [],
  }),

  watch: {
    dialog(value) {
      if (!value) {
        this.currentIndexOf = -1
      }
    },

    form: {
      deep: true,
      handler(form) {
        for (let [index, item] of Object.entries(form)) {
          if (!item?.type) {
            item.type = this.paymentTypes.find(
              (h) => h.value === item.type_payment_id
            )
          }
        }
      },
    },

    '$v.form.$invalid'(value) {
      this.$emit('valid', !value)
    },
  },

  computed: {
    lastIndex() {
      return this.form.length - 1
    },

    filterPaymentByType() {
      return (value) => {
        return [...this.paymentTypes]
          .filter((h) => h.is_payment_on_time === value)
          .filter((h) => !(this.hasSale && h.value == 9))
      }
    },

    getTypeTitle() {
      return (id) =>
        this.types.find((h) => h.value === id)?.text ?? 'Forma de Pagamento'
    },

    getPaymentType() {
      return (id) => {
        return (
          this.paymentTypes.find((h) => h.value === id) ?? {
            text: 'Tipo de Pagamento',
          }
        )
      }
    },

    orderRecords() {
      return this.form.sort(
        (a, b) => a.installment_number - b.installment_number
      )
    },

    input() {
      return this.$v.form.$each.$iter[this.currentIndexOf]
    },

    model() {
      return this.form[this.currentIndexOf]
    },

    sumInstallments() {
      return Number(this.form.reduce((a, b) => a + b.value, 0)).toFixed(2)
    },

    prevInstallmentValue() {
      return (item) => {
        let currentIndex = this.form.findIndex((h) => h.id === item.id)
        let prevIndex = currentIndex - 1

        if (prevIndex === -1) return Number(this.total).toFixed(2)

        return Number(this.total - this.form[prevIndex].value).toFixed(2)
      }
    },

    getOriginalById() {
      return (id) => this.original.find((h) => h.id === id) ?? { ...this.base }
    },

    getTotalAvailable() {
      return this.total - this.form.reduce((a, b) => a + b.value, 0)
    },
  },

  validations() {
    const form = {
      $each: {
        receipt_date: { required },
        type_payment_id: { required },
        value: {
          required,
          gt: gt(0),
          lte: lte((vm) => {
            const check = this.prevInstallmentValue(vm)
            //
            return check
          }),
        },
        code: {},
        type_id: { required },
        installment_number: {},
        payments: {
          $each: {
            value: {
              required,
              gt: gt(0),
              lte: lte((vm) => this.form[vm.parent].value),
            },
            code: {
              required: requiredIf((vm) => {
                const payment = this.paymentTypes.find(
                  (h) => h.value === vm.type_payment_id
                )

                return payment?.value && payment.value === 9
              }),
            },
            type_payment_id: { required },
            payment_date: { required },
          },
        },
      },
    }

    return { form }
  },

  methods: {
    /**
     * Adicionar.
     *
     * @returns {void}
     */
    add() {
      if (this.total <= 0) {
        this.$notify.info('Informe o valor da operação!')
        return
      }

      const lastItem = this.form.sort(
        (a, b) => b.installment_number - a.installment_number
      )[0] ?? {
        installment_number: 0,
        id: null,
        ref: uniqueId('rascunho_'),
      }

      const item = {
        ...this.base,
        ref: uniqueId('rascunho_'),
        installment_number: lastItem.installment_number + 1,
        payments: [],
        value: this.form.length === 0 ? this.total : this.getTotalAvailable,
      }

      this.form.push({ ...item })

      //* adicionar a lista de novos
      this.newRecords.push(item.ref)

      this.draft.push(item.ref)

      this.currentIndexOf = this.lastIndex

      this.dialog = true
    },

    /**
     * Editar.
     *
     * @param {*} item
     * @param {*} index
     * @returns {void}
     */
    edit(item, index) {
      this.dialog = true

      this.draft.push(item.ref)

      this.currentIndexOf = index
    },

    /**
     * Remover linha.
     *
     * @returns {void}
     */
    remove(item, index, confirmed = false) {
      if (!confirmed && !confirm('Tem certeza que deseja remover a parcela?')) {
        return
      }

      const remove = this.newRecords.indexOf(item.ref)

      remove > -1 && this.newRecords.splice(remove)

      this.form.splice(index, 1)
      this.emitUpdateForm()
    },

    /**
     * Remover todos registros.
     *
     * @returns {void}
     */
    removeAll() {
      if (!confirm('Remover todos os itens?')) {
        return
      }

      this.form = []
      this.$v.form.$reset()
      this.emitUpdateForm()
    },

    /**
     * Sincronizar.
     *
     * @returns {void}
     */
    createOrUpdate(input) {
      try {
        input.$touch()

        input.$model.receipt_date = this.$helper.formatDate(
          input.$model.receipt_date,
          'YYYY-MM-DD'
        )

        this.draft = this.draft.filter((h) => h !== input.$model.ref)

        this.dialog = false

        this.emitUpdateForm()
      } catch (e) {
        this.$notify.error('Erro inesperado!')
      }
    },

    /**
     * Carregar tipos de pagamento.
     *
     * @returns {void}
     */
    async fetchPaymentTypes() {
      const data = await this.$axios.$get(
        'api/type-payment?select=id,title,is_payment_on_time,has_document'
      )

      this.paymentTypes = data
        .map((h) => {
          const { id: value, title: text, is_payment_on_time, has_document } = h

          return {
            text,
            value,
            is_payment_on_time: Number(is_payment_on_time),
            has_document: Boolean(has_document),
          }
        })
        .filter((h) => !(this.hasSale && h.value === 9))
    },

    /**
     * Remover colunas não mapeadas.
     *
     * @param {*} form
     * @returns {*}
     */
    filterForm(form) {
      return form.map((h) => this.removeUnused(h))
    },

    /**
     * Retorna colunas não mapeadas no objeto.
     *
     * @param {*} item
     */
    removeUnused(item) {
      return omitBy(item, (value, key) => !Object.keys(this.base).includes(key))
    },

    /**
     * Enviar alterações ao componente pai.
     *
     * @returns {void}
     */
    emitUpdateForm() {
      const validItems = this.filterForm(this.form).filter(
        (h, index) => !this.$v.form.$each.$iter[index].$invalid
      )

      this.$emit('valid', true)
      this.$emit('input', validItems)
    },

    /**
     * Adicionar pagamento ao parcelamento.
     *
     * @param {*} input
     * @returns {void}
     */
    addPayment(input, value) {
      const installmentTotal = input.$model.value
      const totalAvailbale = sumBy(input.$model.payments, (h) => h.value)

      input.$model.payments.push({
        value: installmentTotal - totalAvailbale,
        type_payment_id: input.$model.type_payment_id,
        payment_date: null,
        parent: this.currentIndexOf,
      })
    },

    /**
     * Remover pagamento.
     *
     * @returns {void}
     */
    removePayment(input, payment = {}, index) {
      input.$model.payments.splice(index, 1)
    },

    /**
     * Montar componente.
     *
     * @retunrs {void}
     */
    update() {
      this.original = cloneDeep(this.rowsMultable)

      const form = this.rowsMultable.map((h, index) => {
        const { receipt_date, payments, ...item } = h
        const type = item.type

        return {
          ref: uniqueId('rascunho_'),
          type_id: Number(type?.is_payment_on_time ?? 0),
          type_payment_id: type?.id,
          receipt_date: this.$helper.formatDate(receipt_date, 'YYYY-MM-DD'),
          installment_number: Number(index) + 1,
          payments: payments.map((payment) => ({
            parent: index,
            id: payment.id,
            code: payment?.code,
            type_payment_id: payment.type?.id ?? payment?.type_payment_id,
            value: payment.value,
            payment_date: payment.payment_date,
          })),
          ...item,
        }
      })

      this.form = form

      this.$forceUpdate()

      this.$v.form.$reset()

      this.$emit('valid', !this.$v.form.$invalid)
    },

    /**
     * Redefinir dados da parcela em edi/cão.
     *
     * @param {*} input
     */
    reset(input) {
      const original = this.getOriginalById(input.$model.id)

      const [newRecordIndex, draftIndex] = [
        this.newRecords.indexOf(this.model.ref),
        this.draft.indexOf(this.model.ref),
      ]

      Object.assign(input.$model, { ...original })

      draftIndex > -1 && this.draft.splice(draftIndex, 1)

      if (newRecordIndex !== -1) {
        this.remove(original, this.currentIndexOf, true)
      }

      this.update()

      input.$reset()

      this.closeDialog()
    },

    /**
     * Atualizar valor da parcela para total do pedido.
     *
     * @param {*} value
     */
    updateType(value) {
      const partial =
        this.total -
        this.form
          .filter((h) => h.ref !== this.model.ref)
          .reduce((a, b) => a + b.value, 0)

      switch (value) {
        case 1:
          // acrescentar total a pagar.
          this.model.value = partial

          this.model.receipt_date =
            this.model.receipt_date ?? moment().format('YYYY-MM-DD')

          if (this.model.payments.length > 0) {
            //* remove apenas as não pagas.
            this.model.payments = this.model.payments.filter(
              (h) => !h.payment_date
            )
            this.input.payments.$touch()
          }

          //* adicionar baixa com valor correto.
          this.addPayment(this.input)

          this.input.value.$touch()
          this.input.receipt_date.$touch()
          break
        default:
          this.model.value = partial
          this.input.value.$touch()
          this.model.payments = []
          this.input.payments.$touch()
          break
      }
    },

    /**
     * Sincroniza baixas.
     */
    updatePaymentType() {
      const { is_payment_on_time } = this.paymentTypes.find(
        (h) => h.value === this.model.type_payment_id
      )

      if (!is_payment_on_time) return

      if (this.model.payments.length === 0) {
        this.addPayment(this.input, this.getTotalAvailable)
      }

      for (let [, payment] of Object.entries(this.model.payments)) {
        payment.value = this.model.value
        payment.payment_date =
          payment.payment_date ??
          this.model.receipt_date ??
          moment().format('YYYY-MM-DD')
        payment.type_payment_id = this.model.type_payment_id
      }

      this.input.$touch()
    },

    /**
     * Sincronizar dados.
     *
     * @param {*} payment
     * @param {*} data
     */
    docPriceUpdate(payment, event = {}, index = -1) {
      try {
        // payment.$model.code = event?.code
        // payment.code.$touch()

        for (let [self, payment] of Object.entries(this.model.payments)) {
          payment.code = event.code
        }

        this.input.$touch()
      } catch (e) {
        console.warn('falhou: %s', e)
      }
    },
  },

  async created() {
    await this.fetchPaymentTypes()
  },

  mounted() {
    this.rowsMultable = cloneDeep(this.rows)
    this.update()

    this.$bus.$on('editor:installment:sync', (items, cancel = false) => {
      this.rowsMultable = cloneDeep(items)

      this.update()

      if (!cancel) return

      this.newRecords = []
      this.draft = []
    })
  },

  beforeDestroy() {
    this.$bus.$off('editor:installment:sync')
  },
}
</script>

<style lang="scss" scoped>
.editor-installment {
  .actived {
    background-color: transparent;
    &::before {
      opacity: 0;
    }
  }

  .invalid {
    border: 1px solid red;
  }
}

.v-subheader {
  padding-left: 0;
  height: 32px;
  margin-top: 0.5rem;
}
</style>
