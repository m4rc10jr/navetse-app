<template>
  <modal-form @save="save(form)" @cancel="cancel" :form="form">
    <v-row>
      <column md="6">
        <input-text
          label="Titulo"
          v-model.trim="form.title"
          :errors="watchErrorMessages('title')"
          @input="$v.form.title.$touch"
        />
      </column>

      <column md="6">
        <select-default
          v-model.trim="form.type"
          @input="$v.form.type.$touch"
          :error-messages="watchErrorMessages('type')"
          label="Tipo"
          :items="types"
        />
      </column>
    </v-row>
  </modal-form>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators'

import form from '~/mixins/form-component'

export default {
  name: 'AccountForm',

  mixins: [form],

  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },

  data: () => ({
    endpoint: '/api/accounts',

    rules: {
      title: { required, minLength: minLength(4) },
      type: { required },
    },

    base: {
      title: null,
      type: 'input',
    },

    types: [
      { text: 'Entradas', value: 'input' },
      { text: 'Saídas', value: 'output' },
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
