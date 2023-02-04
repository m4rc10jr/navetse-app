<template>
  <div>
    <modal v-model="dialog" @close="close" width="35vw">
      <v-toolbar-title slot="header">Pagar Parcelas</v-toolbar-title>

      <modal-form
        @save="processPayments"
        @cancel="close"
        :form="form"
        :invalid="$v.form.$invalid"
      >
        <v-row>
          <column md="7">
            <select-dynamic
              label="Tipo de Pagamento"
              endpoint="/api/type-payment"
              :api-options="{
                select: 'id,title',
              }"
              item-text="title"
              v-model="$v.form.type_id.$model"
              @input="$v.form.type_id.$touch"
              :errorMessages="watchErrorMessages('type_id', 'tipo')"
            />
          </column>

          <column md="5">
            <input-currency
              label="Valor"
              placeholder="informe o valor para dar baixa"
              v-model="$v.form.value.$model"
              @input="$v.form.value.$touch"
              :input-options="{ hideDetails: true }"
              :error-messages="
                watchErrorMessages('value', 'valor', {
                  lte: $helper.currency.brl(pending),
                  gt: $helper.currency.brl(1),
                })
              "
            />
          </column>
        </v-row>

        <v-row class="mt-0">
          <column md="12">
            <v-switch
              label="Salvar registro ao incluir saldo"
              v-model="form.paid"
              @input="$v.form.paid.$touch"
              hide-details
              dense
            />
          </column>

          <v-flex md12 mx-3>
            <small
              >* Total de <b>{{ pending | brl }}</b> a serem pagos.</small
            >
          </v-flex>
        </v-row>
      </modal-form>
    </modal>

    <v-btn
      color="primary darken-1"
      block
      depressed
      @click="dialog = true"
      :disabled="!installments.length || pending <= 0"
    >
      <custom-icon>payments</custom-icon>
      <span class="ml-1">Pagar Parcelas</span>
    </v-btn>
  </div>
</template>

<script>
import validate from '../../../mixins/validate'
import { lte, gt } from '../../../plugins/rules'
import { required } from 'vuelidate/lib/validators'
import { orderBy, sumBy } from 'lodash'
export default {
  name: 'FormLowInstallment',

  mixins: [validate],

  props: {
    amount: Number,
    installments: Array,
  },

  data: () => ({
    form: {
      value: 0,
      amount: 0,
      type_id: null,
      paid: false,
    },

    dialog: false,
  }),

  computed: {
    totalPaid() {
      return sumBy(this.installments, (h) =>
        h.payments.reduce((a, b) => a + b.value, 0)
      )
    },

    pending() {
      return this.amount - this.totalPaid
    },
  },

  watch: {
    pending(value) {
      this.form.amount = value
    },

    dialog(value) {
      this.form.amount = this.pending
    },
  },

  validations: {
    form: {
      value: {
        required,
        gt: gt(1),
        lte: lte('amount'),
      },
      paid: {},
      type_id: { required },
    },
  },

  methods: {
    close() {
      this.form.value = 0
      this.dialog = false
    },

    processPayments() {
      const base = {
        code: null,
        parent: -1,
        value: 0,
        type_payment_id: this.form.type_id,
        payment_date: this.$helper.moment().format('YYYY-MM-DD'),
      }

      const ordered = orderBy(this.installments, (h) => h.receipt_date, 'asc')

      let available = this.form.value

      for (let [parent, installment] of Object.entries(ordered)) {
        const { value: amount, payments = [] } = installment

        const total_paid = sumBy(payments, 'value')

        //* parcelas pagas.
        if (total_paid >= amount) continue

        const pending = amount - total_paid

        if (available <= 0 || pending <= 0) break

        if (available >= pending) {
          installment.payments.push({ ...base, parent, value: pending })
          available = available - pending
          continue
        }

        if (pending > available) {
          installment.payments.push({ ...base, parent, value: available })
          available -= pending - available
          continue
        }
      }

      this.$bus.$emit('editor:installment:sync', this.installments)

      this.$notify.info(
        `O valor ${this.$helper.currency.brl(
          this.form.value
        )} foi adicionado as parcelas.`
      )

      this.form.paid && this.$emit('save')
      this.close()
    },
  },

  created() {
    this.form.amount = this.pending
  },
}
</script>

<style lang="scss" scoped></style>
