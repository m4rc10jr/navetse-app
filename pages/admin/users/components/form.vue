<template>
  <modal-form @save="save(form)" @cancel="cancel" :form="form">
    <v-row>
      <column md="12">
        <select-dynamic
          endpoint="/api/companies"
          :api-options="{
            select: 'id,name',
          }"
          item-text="name"
          v-model="form.company_id"
          @input="$v.form.company_id.$touch"
          label="Empresa"
        />
      </column>

      <column md="6">
        <input-text
          label="Nome"
          placeholder="Fulano"
          :error-messages="watchErrorMessages('name')"
          v-model.trim="form.name"
          @input="$v.form.name.$touch()"
        />
      </column>

      <column md="6">
        <input-text
          label="Email"
          placeholder="fulano@example.com"
          :error-messages="watchErrorMessages('email')"
          v-model.trim="form.email"
          @input="$v.form.email.$touch()"
        />
      </column>
    </v-row>

    <v-row>
      <column md="6">
        <input-password
          label="Senha"
          :errors="watchErrorMessages('password')"
          v-model="form.password"
          @input="$v.form.password.$touch()"
        />
      </column>

      <column md="6">
        <input-password
          label="Repetir Senha"
          :errors="watchErrorMessages('password_confirmation')"
          v-model="form.password_confirmation"
          @input="$v.form.password_confirmation.$touch()"
        />
      </column>
    </v-row>

    <v-row class="mb-4">
      <v-col md="12" class="mt-0 py-0 mb-2">
        <v-switch
          label="Usuário Administrador"
          v-model="form.is_admin"
          @input="$v.form.is_admin.$touch"
          hide-details
          class="mt-0"
        />
      </v-col>

      <v-col md="12" class="mt-0 py-0 mb-2">
        <v-switch
          label="Permissão para visualizar relatório?"
          v-model="form.has_report"
          @input="$v.form.has_report.$touch"
          hide-details
          class="mt-0"
        />
      </v-col>
    </v-row>
  </modal-form>
</template>

<script>
import {
  required,
  minLength,
  sameAs,
  email,
  requiredIf,
} from 'vuelidate/lib/validators'
import form from '~/mixins/form-component'

export default {
  name: 'FormUser',

  mixins: [form],

  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },

  data: () => ({
    endpoint: '/api/users',

    rules: {
      company_id: { required },
      name: { required, minLength: minLength(4) },
      email: { required, email },
      password: {
        minLength: minLength(6),
        requiredIf: requiredIf(function () {
          return !this.form?.id
        }),
      },
      password_confirmation: {
        sameAsPassword: sameAs('password'),
      },
      has_report: {},
      is_admin: {},
    },

    base: {
      name: null,
      email: null,
      company_id: null,
      password: '',
      password_confirmation: '',
      has_report: false,
      is_admin: false,
    },
  }),

  mounted() {
    this.item = { ...this.data }
  },
}
</script>

<style lang="scss" scoped>
.multi_line {
  border-top: 1px solid #ccc;
}
</style>
