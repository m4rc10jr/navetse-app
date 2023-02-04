<template>
  <modal-form @save="save(form)" @cancel="cancel" :form="form">
    <v-row class="mt-2">
      <column md="12">
        <input-text
          v-model.trim="form.name"
          :errors="watchErrorMessages('name')"
          @input="$v.form.name.$touch"
          label="Nome"
        />
      </column>
    </v-row>

    <v-row>
      <column md="6">
        <input-text
          v-model.trim="form.abbreviation"
          :errors="watchErrorMessages('abbreviation', 'abreviação')"
          @input="$v.form.abbreviation.$touch"
          label="Abreviação"
        />
      </column>

      <column md="6">
        <input-text
          v-model.trim="form.region"
          :errors="watchErrorMessages('region', 'região')"
          @input="$v.form.region.$touch"
          label="Região"
        />
      </column>
    </v-row>
  </modal-form>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators'

import form from '~/mixins/form-component'

export default {
  name: 'StateForm',

  mixins: [form],

  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },

  data: () => ({
    endpoint: '/api/states',

    rules: {
      name: { required, minLength: minLength(4) },
      region: { required },
      abbreviation: { required },
    },

    base: {
      name: null,
      abbreviation: null,
      region: null,
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
