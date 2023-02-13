<template>
  <modal-form @save="save(form)" @cancel="cancel" :form="form">
    <v-row>
      <column md="12">
        <input-text
          label="Nome"
          v-model.trim="form.name"
          :errors="watchErrorMessages('name')"
          @input="inputName($v)"
        />
      </column>

      <column md="12">
        <input-text
          label="Código BI"
          placeholder="https://"
          type="url"
          v-model="form.bi_url"
          @input="$v.form.bi_url.$touch"
          disabled
          :errors="watchErrorMessages('bi_url')"
        />
      </column>
    </v-row>

    <v-row>
      <v-col cols md12>
        <v-card flat class="my-2">
          <v-toolbar flat dense>
            <v-tabs
              v-model="tab"
              color="primary"
              slider-color="primary"
              background-color="#f1f1f1"
            >
              <v-tab> Configurações </v-tab>
              <v-tab> Módulos </v-tab>
            </v-tabs>
          </v-toolbar>

          <v-tabs-items v-model="tab">
            <v-tab-item class="mx-2">
              <v-row class="my-2">
                <column md="4">
                  <v-switch
                    label="Empresa Matriz?"
                    v-model="form.main"
                    @input="$v.form.main.$touch"
                    dense
                    :disabled="form.is_branch"
                    :persistent-hint="form.is_branch"
                    :hide-details="!form.is_branch"
                    hint="* Essa empresa é uma filial."
                    class="mt-0"
                  />
                </column>
                <column md="12">
                  <uploader-logo :logo="form.logo" @send="prepareFiles" />
                </column>
                <v-slide-y-transition>
                  <column md="12" class="my-2" v-if="form.main">
                    <select-dynamic
                      label="Filiais"
                      endpoint="/api/companies"
                      :api-options="{
                        select: 'id,name',
                        'where[main]': 0,
                        'whereNotIn[id]': [form.id || 0, 1].join(','),
                        'scope[noParent]': form.id || 0,
                      }"
                      :select-options="{
                        multiple: true,
                        smallChips: true,
                        maxHeight: 5,
                      }"
                      v-model="form.companies"
                      @input="$v.form.companies.$touch"
                      :errorMessages="watchErrorMessages('companies')"
                    />
                  </column>
                </v-slide-y-transition>
              </v-row>
            </v-tab-item>

            <v-tab-item class="ma-3">
              <v-row>
                <column md="6">
                  <v-switch
                    label="Módulo de Venda?"
                    v-model="form.has_sales"
                    @input="$v.form.has_sales.$touch"
                    hide-details
                    dense
                  />
                </column>

                <column md="6">
                  <v-switch
                    label="Módulo de Notificação via whatsapp?"
                    v-model="form.has_notification"
                    @input="$v.form.has_notification.$touch"
                    hide-details
                    dense
                  />
                </column>
              </v-row>

              <v-row>
                <column md="6">
                  <v-switch
                    label=" Custo baseado nos cadastros"
                    v-model="form.has_cost_product_sales"
                    @input="$v.form.has_cost_product_sales.$touch"
                    hide-details
                    dense
                  />
                </column>

                <column md="6">
                  <v-switch
                    label="Custo baseado em lançamento de dados externos?"
                    v-model="form.has_cost_product_register"
                    @input="$v.form.has_cost_product_register.$touch"
                    hide-details
                    dense
                  />
                </column>
              </v-row>

              <v-row class="mb-4">
                <column md="6">
                  <v-switch
                    label="Custo baseado na ordem de produção?"
                    v-model="form.has_cost_product_order_production"
                    @input="$v.form.has_cost_product_order_production.$touch"
                    hide-details
                    dense
                  />
                </column>

                <column md="6">
                  <v-switch
                    label="Custo baseado nos lançamentos de estoque?"
                    v-model="form.has_cost_product_global"
                    @input="$v.form.has_cost_product_global.$touch"
                    hide-details
                    dense
                  />
                </column>
              </v-row>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </v-col>
    </v-row>
  </modal-form>
</template>

<script>
import { required, minLength, maxLength, url } from 'vuelidate/lib/validators'

import form from '~/mixins/form-component'

export default {
  name: 'CompanyForm',

  mixins: [form],

  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },

  data: () => ({
    endpoint: '/api/companies',
    tab: 'children',
    rules: {
      name: { required, minLength: minLength(4) },
      has_sales: {},
      has_notification: {},
      has_cost_product_sales: {},
      has_cost_product_register: {},
      has_cost_product_order_production: {},
      has_cost_product_global: {},
      bi_url: { url },
      main: {},
      logo: {},
      companies: [],
    },

    base: {
      name: null,
      has_sales: false,
      has_notification: false,
      has_cost_product_sales: false,
      has_cost_product_register: false,
      has_cost_product_order_production: false,
      has_cost_product_global: false,
      bi_url: null,
      logo: null,
      main: false,
      companies: [],
    },
  }),

  watch: {
    'form.main'(value) {
      if (value) return

      this.form.companies = []
      this.$forceUpdate()
    },
  },

  methods: {
    prepare(data) {
      const { is_main = false, companies = [], ...old } = data

      this.item = {
        ...old,
        main: is_main,
        companies: companies.map((h) => h.id),
      }
    },
    inputName(event) {
      this.form.bi_url = encodeURI(
        `https://app.powerbi.com/reportEmbed?reportId=94d351a8-dd31-47fd-82ce-905f7e98456b&autoAuth=true&ctid=3f113021-bfc3-41d8-8541-b5727973136e&pageName=ReportSection11&filter=dim_empresas/EmpresaPai eq ` +
          `'` +
          this.form.name +
          `'`
      )
      event.form.name.$touch
      event.form.bi_url.$touch
    },
    prepareFiles(logo) {
      this.form.logo = logo
      this.$forceUpdate()
    },
  },

  created() {
    // this.item = { ...this.data }
    this.prepare(this.data)
  },
}
</script>

<style lang="scss" scoped>
.multi_line {
  border-top: 1px solid #ccc;
}

.switch-label-column .v-input__slot .v-label {
  width: 250px;
}
</style>
