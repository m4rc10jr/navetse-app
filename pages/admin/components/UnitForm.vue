<template>
  <modal-form @save="save(form)" @cancel="cancel" :form="form">
    <v-row>
      <column md="6">
        <input-text
          v-model.trim="form.title"
          :errors="watchErrorMessages('title')"
          @input="$v.form.title.$touch"
          label="Titulo"
        />
      </column>

      <column md="6">
        <input-text
          v-model.trim="form.symbol"
          :errors="watchErrorMessages('symbol')"
          @input="$v.form.symbol.$touch"
          label="Simbolo"
        />
      </column>
    </v-row>
  </modal-form>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators'

import form from '~/mixins/form-component'

export default {
  name: 'UnitForm',

  mixins: [form],

  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },

  data: () => ({
    endpoint: '/api/units',

    rules: {
      title: { required, minLength: minLength(4) },
      symbol: { required, minLength: minLength(1) },
    },

    base: {
      title: null,
      Symbol: null,
    },
  }),

  computed: {},

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
