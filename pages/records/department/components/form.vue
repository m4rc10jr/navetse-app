<template>
  <modal-form @save="save(form)" @cancel="cancel" :form="form">
    <v-row>
      <column md="12">
        <v-text-field
          label="Titulo"
          placeholder="Time..."
          outlined
          dense
          :error-messages="watchErrorMessages('title')"
          v-model.trim="form.title"
          @input="$v.form.title.$touch()"
        />
      </column>
    </v-row>
  </modal-form>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators'
import form from '~/mixins/form-component'

export default {
  name: 'FormTeam',
  mixins: [form],

  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },

  data: () => ({
    endpoint: '/api/departments',

    rules: {
      title: { required, minLength: minLength(4) },
    },

    base: {
      title: '',
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
