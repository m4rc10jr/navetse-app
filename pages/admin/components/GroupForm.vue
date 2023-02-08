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
    </v-row>
  </modal-form>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators'

import form from '~/mixins/form-component'

export default {
  name: 'GroupForm',

  mixins: [form],

  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },

  data: () => ({
    endpoint: '/api/groups',

    rules: {
      title: { required, minLength: minLength(4) },
    },

    base: {
      title: null,
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
