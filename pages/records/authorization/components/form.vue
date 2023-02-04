<template>
  <modal-form @save="save(form)" @cancel="cancel" :form="form">
    <v-row>
      <column md="9">
        <select-dynamic
          label="Usuários"
          endpoint="/api/users"
          item-text="name"
          v-model="$v.form.requester_id.$model"
          :api-options="{ select: 'id,name' }"
          :error-messages="watchErrorMessages('requester_id')"
        />
      </column>

      <column md="3">
        <input-text
          label="Limite de uso"
          v-model="$v.form.usage_limit.$model"
          @input="$v.form.usage_limit.$touch"
          :error-messages="watchErrorMessages('usage_limit')"
        />
      </column>
    </v-row>
  </modal-form>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
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
    endpoint: '/api/access-permission',

    rules: {
      requester_id: { required },
      usage_limit: { required },
    },

    base: {
      requester_id: '',
      usage_limit: 1,
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
