<template>
  <modal-form @save="save(form)" @cancel="cancel" :form="form">
    <v-row>
      <column md="12">
        <select-dynamic
          endpoint="/api/accounts"
          :api-options="{
            select: 'id,title',
          }"
          item-text="title"
          v-model="form.account_id"
          @input="$v.form.account_id.$touch"
          label="Conta"
        />
      </column>

      <column md="6">
        <input-text
          label="Titulo"
          v-model.trim="form.title"
          :errors="watchErrorMessages('title')"
          @input="$v.form.title.$touch"
        />
      </column>

      <column md="6">
        <input-text
          label="Grupo"
          v-model.trim="form.group"
          :errors="watchErrorMessages('group')"
          @input="$v.form.group.$touch"
        />
      </column>
    </v-row>

    <v-row class="mt-2">
      <column md="6">
        <input-text
          label="Cálculo DRE"
          v-model.trim="form.dre_calc"
          :errors="watchErrorMessages('dre_calc')"
          @input="$v.form.dre_calc.$touch"
        />
      </column>

      <column md="6">
        <input-text
          label="Cálculo DFC"
          v-model.trim="form.dfc_calc"
          :errors="watchErrorMessages('dfc_calc')"
          @input="$v.form.dfc_calc.$touch"
        />
      </column>
    </v-row>
  </modal-form>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators'

import form from '~/mixins/form-component'

export default {
  name: 'SubAccountForm',

  mixins: [form],

  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },

  data: () => ({
    endpoint: '/api/sub-account?account[load]=*',

    rules: {
      title: { required, minLength: minLength(4) },
      group: {},
      dfc_calc: { required },
      dre_calc: { required },
      account_id: { required },
    },

    base: {
      title: null,
      group: null,
      dre_calc: null,
      dfc_calc: null,
      account_id: null,
    },
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
