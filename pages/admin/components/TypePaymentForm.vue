<template>
  <modal-form @save="save(form)" @cancel="cancel" :form="form">
    <v-row>
      <column md="12">
        <input-text
          v-model.trim="form.title"
          @input="$v.form.title.$touch"
          :errors="watchErrorMessages('title')"
          label="Titulo"
        />
      </column>
    </v-row>

    <v-row class="mt-0 mb-4">
      <column md="6">
        <v-switch
          class="switch-label-column"
          label="Requer Documentos?"
          v-model="form.has_document"
          @input="$v.form.has_document.$touch"
          hide-details
          dense
        />
      </column>

      <column md="6">
        <v-switch
          class="switch-label-column"
          label="Pagamento a vista?"
          v-model="form.is_payment_on_time"
          @input="$v.form.is_payment_on_time.$touch"
          hide-details
          dense
        />
      </column>
    </v-row>
  </modal-form>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators'

import form from '~/mixins/form-component'

export default {
  name: 'TypePaymentForm',

  mixins: [form],

  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },

  data: () => ({
    endpoint: '/api/type-payment',

    rules: {
      title: { required, minLength: minLength(4) },
      has_document: {},
      is_payment_on_time: {},
    },

    base: {
      title: null,
      has_document: false,
      is_payment_on_time: false,
    },

    groups: [
      { text: 'à vista', value: 1 },
      { text: 'à prazo', value: 2 },
    ],
  }),

  created() {
    this.item = { ...this.data }
  },
}
</script>

<style lang="scss" scoped>
.multi_line {
  border-top: 1px solid #ccc;
}
</style>
