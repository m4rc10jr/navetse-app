<template>
  <modal-form @save="save(form)" @cancel="cancel" :form="form">
    <v-row>
      <column md="6">
        <input-text
          v-model.trim="form.name"
          :errors="watchErrorMessages('name')"
          @input="$v.form.name.$touch"
          label="Nome"
        />
      </column>

      <column md="6">
        <select-default
          label="Estado"
          v-model.trim="form.state_id"
          @input="$v.form.state_id.$touch"
          :errors="watchErrorMessages('state_id')"
          :options="{
            itemText: 'name',
            itemValue: 'id',
            smallChips: true,
          }"
          :items="states"
        />
      </column>
    </v-row>

    <v-row>
      <column md="6">
        <input-text
          v-model.trim="form.id_ibge"
          :error-messages="watchErrorMessages('id_ibge')"
          @input="$v.form.id_ibge.$touch"
          label="ID IBGE"
        />
      </column>

      <column md="6">
        <input-text
          v-model.trim="form.size"
          :error-messages="watchErrorMessages('size')"
          @input="$v.form.size.$touch"
          label="Tamanho"
        />
      </column>
    </v-row>

    <v-row class="my-0">
      <column md="12">
        <v-switch
          class="switch-label-column"
          label="É Capital?"
          v-model="form.is_capital"
          @input="$v.form.is_capital.$touch"
          hide-details
        />
      </column>
    </v-row>
  </modal-form>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'

import form from '~/mixins/form-component'

export default {
  name: 'CityForm',

  mixins: [form],

  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },

  data: () => ({
    endpoint: '/api/cities',

    rules: {
      name: { required, minLength: minLength(4) },
      id_ibge: {},
      size: {},
      is_capital: {},
      state_id: { required },
    },

    base: {
      name: null,
      id_ibge: null,
      size: null,
      is_capital: false,
      state_id: null,
    },
  }),

  computed: {
    ...mapGetters({
      states: 'resources/states',
    }),
  },

  created() {
    this.item = { ...this.data }
    this.item.state_id = this.data.state.id
  },
}
</script>

<style lang="scss" scoped>
.multi_line {
  border-top: 1px solid #ccc;
}
</style>
