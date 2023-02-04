<template>
  <modal-form @save="save(form)" @cancel="cancel" :form="form">
    <v-row class="mt-2">
      <v-col md="4">
        <v-select
          outlined
          :items="types"
          v-model="form.type_id"
          label="Tipo"
          hide-details
          dense
          :error-messages="watchErrorMessages('type_id')"
          @input="$v.form.type_id.$touch()"
        ></v-select>
      </v-col>

      <v-col cols md="4">
        <v-select
          outlined
          dense
          :items="personTypes"
          hide-details
          v-model="form.type_person"
          label="Pessoa"
          :error-messages="watchErrorMessages('type_person')"
          @input="$v.form.type_person.$touch()"
        ></v-select>
      </v-col>

      <v-col cols md="4">
        <input-currency
          label="Limite de Crédito"
          :error-messages="watchErrorMessages('credit_limit')"
          v-model="form.credit_limit"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols md="12">
        <v-text-field
          label="Nome"
          placeholder="Fulano da Silva"
          outlined
          hide-details
          dense
          :error-messages="watchErrorMessages('name')"
          v-model.trim="form.name"
          @input="$v.form.name.$touch()"
        />
      </v-col>

      <v-col cols md="6" xs="12">
        <v-text-field
          label="Telefone"
          placeholder="(00) 0000-0000"
          outlined
          :error-messages="watchErrorMessages('phone')"
          v-model.trim="mask.phone"
          v-mask="'(##) #####-####'"
          ref="inputPhone"
          hide-details
          dense
        />
      </v-col>

      <v-col cols md="6" xs="12">
        <v-text-field
          label="Documento"
          placeholder="000.000.000-00"
          v-mask="['###.###.###-##', '###.###.###/####-##']"
          :error-messages="watchErrorMessages('document')"
          outlined
          v-model.trim="mask.document"
          hide-details
          dense
        />
      </v-col>
    </v-row>

    <v-row class="mt-3">
      <v-col cols md="6">
        <select-dynamic
          label="Estado"
          v-model="form.state_id"
          :select-options="{
            hideDetails: true,
          }"
          :item-text="(h) => h.name"
          no-api-data
          :data="states"
        />
      </v-col>
      <v-fade-transition>
        <v-col cols md="6" v-if="cities.length > 0" key="cities">
          <select-dynamic
            label="Cidade"
            no-api-data
            :select-options="{
              cacheItems: false,
              hideDetails: true,
            }"
            v-model="form.city_id"
            :item-text="(h) => h.name"
            :data="cities"
          />
        </v-col>
      </v-fade-transition>
    </v-row>

    <v-row>
      <v-col cols md="12">
        <v-textarea
          label="Observação"
          v-model.trim="form.description"
          outlined
          hide-details
        />
      </v-col>
    </v-row>
  </modal-form>
</template>

<script>
import { cloneDeep } from 'lodash'
import { required, minLength } from 'vuelidate/lib/validators'
import form from '~/mixins/form-component'
import { mapGetters } from 'vuex'
export default {
  name: 'FormClient',

  mixins: [form],

  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },

  data: () => ({
    endpoint: '/api/entities',

    cityLoading: false,

    rules: {
      name: { required, minLength: minLength(4) },
      city_id: {},
      type_id: { required },
      type_person: { required },
      phone: {},
      document: {},
      deadline_payment: {},
      description: {},
      credit_limit: {},
    },

    mask: {
      phone: '',
      document: '',
    },

    base: {
      name: '',
      phone: '',
      document: '',
      credit_limit: 0,
      type_id: 1,
      city_id: '',
      state_id: '',
      type_person: 'physical',
      created_at: null,
      updated_at: null,
    },

    types: [
      { text: 'Cliente', value: 1 },
      { text: 'Fornecedor', value: 2 },
    ],

    personTypes: [
      { text: 'Física', value: 'physical' },
      { text: 'Jurídica', value: 'legal' },
    ],
  }),

  computed: {
    cities() {
      return this.defaultCities.filter((h) => h.state.id === this.form.state_id)
    },

    ...mapGetters({
      states: 'resources/states',
      defaultCities: 'resources/cities',
    }),
  },

  watch: {
    mask: {
      deep: true,
      handler(input) {
        for (let [key, value] of Object.entries(input)) {
          this.form[key] = this.$helper.clearText(value)
          this.$v.form[key].$touch()
        }
      },
    },
  },

  methods: {
    refresh() {
      const { type = {}, document, phone, city = {} } = this.data
      this.item = cloneDeep(this.data)
      this.item.type_id = type?.id
      this.item.city_id = city?.id
      this.item.state_id = city?.state_id

      this.mask.phone = phone
      this.mask.document = document
    },
  },

  created() {
    this.refresh()
  },
}
</script>

<style lang="scss" scoped>
.multi_line {
  border-top: 1px solid #ccc;
}
</style>
