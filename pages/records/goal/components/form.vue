<template>
  <modal-form @save="save(form)" @cancel="cancel" :form="form">
    <v-row>
      <column md="12">
        <select-dynamic
          label="Departamento"
          endpoint="/api/departments"
          item-text="title"
          v-model="$v.form.department_id.$model"
          :api-options="{ select: 'id,title' }"
          :error-messages="watchErrorMessages('department_id')"
        />
      </column>
      <column md="6">
        <input-currency
          label="Meta"
          :error-messages="watchErrorMessages('amount')"
          v-model.trim="form.amount"
          @input="$v.form.amount.$touch()"
        />
      </column>

      <column md="6">
        <input-competence-date
          :error-messages="watchErrorMessages('competence_date')"
          v-model.trim="form.competence_date"
          @input="$v.form.competence_date.$touch()"
        />
      </column>
    </v-row>
  </modal-form>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
import form from '~/mixins/form-component'

export default {
  name: 'FormGoal',

  mixins: [form],

  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },

  data: () => ({
    endpoint: '/api/goals',

    rules: {
      department_id: { required },
      amount: { required },
      competence_date: { required },
    },

    base: {
      department_id: '',
      amount: 0,
      competence_date: '',
    },
  }),

  computed: {
    ...mapGetters('account', {
      mainCompany: 'companyInUse',
    }),
  },

  methods: {
    afterLoad(data) {
      const { department = {}, competence_date = null, ...form } = data
      return {
        ...form,
        competence_date,
        department_id: !data?.id
          ? this.mainCompany?.options?.department_id
          : department?.id,
      }
    },
  },

  created() {
    this.item = this.afterLoad({ ...this.data })
  },
}
</script>

<style lang="scss" scoped>
.multi_line {
  border-top: 1px solid #ccc;
}
</style>
