<template>
  <page>
    <breadcrumb slot="header" title="Minha Empresa" />

    <v-card dense :disabled="loading">
      <v-card-text v-if="loaded">
        <row-info :row="form" />

        <v-row>
          <column md="4">
            <input-text label="Empresa" v-model="form.name" disabled />
          </column>

          <column md="8">
            <input-text
              label="BI URL"
              v-bind:value="
                encodeURI(
                  `https://app.powerbi.com/reportEmbed?reportId=94d351a8-dd31-47fd-82ce-905f7e98456b&autoAuth=true&ctid=3f113021-bfc3-41d8-8541-b5727973136e&pageName=ReportSection11&filter=dim_empresas/EmpresaPai eq ` +
                    `'` +
                    form.name +
                    `'`
                )
              "
              disabled
            />
          </column>
        </v-row>

        <!-- filiais -->
        <v-row>
          <v-col cols md="12">
            <v-card v-if="form.is_main" flat dense>
              <v-toolbar dense flat>
                <custom-icon class="mr-1">apartment</custom-icon>
                <v-toolbar-title>Minhas Filiais</v-toolbar-title>
              </v-toolbar>
              <v-divider></v-divider>
              <v-list class="mb-0 pb-0">
                <v-list-item
                  v-for="(item, index) in form.companies"
                  :key="index"
                >
                  <v-list-item-action>
                    <chip color="primary">
                      {{ item.id }}
                    </chip>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
        <!-- end: branchs -->

        <!-- begin: settings -->
        <v-row>
          <v-col cols md="12">
            <v-card flat dense>
              <v-toolbar dense flat>
                <custom-icon class="mr-1">settings</custom-icon>
                <v-toolbar-title>Configurações</v-toolbar-title>
              </v-toolbar>
              <v-divider></v-divider>

              <v-card-text>
                <v-row>
                  <column md="4">
                    <select-dynamic
                      label="Departamento Padrão"
                      endpoint="/api/departments"
                      :api-options="{
                        select: 'id,title',
                      }"
                      item-text="title"
                      v-model="form.options.department_id"
                      @input="$v.form.options.department_id.$touch"
                      :errorMessages="
                        watchErrorMessages('options.department_id')
                      "
                    />
                  </column>

                  <column md="4">
                    <select-dynamic
                      label="Cliente Padrão"
                      endpoint="/api/entities"
                      :api-options="{
                        select: 'id,name',
                      }"
                      item-text="name"
                      v-model="form.options.entity_id"
                      @input="$v.form.options.entity_id.$touch"
                      :errorMessages="watchErrorMessages('options.entity_id')"
                    />
                  </column>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <!-- end: settings -->

        <!-- modules -->
        <v-row>
          <v-col cols md="12">
            <v-card flat dense>
              <v-toolbar dense flat>
                <custom-icon class="mr-1">view_module</custom-icon>
                <v-toolbar-title>Módulos</v-toolbar-title>
              </v-toolbar>
              <v-divider></v-divider>
              <v-card-text>
                <v-row>
                  <column md="4">
                    <v-switch
                      class="switch-label-column"
                      label="Módulo de Venda?"
                      v-model="form.has_sales"
                      hide-details
                      dense
                      disabled
                    />
                  </column>

                  <column md="4">
                    <v-switch
                      class="switch-label-column"
                      label="Módulo de Notificação via whatsapp?"
                      v-model="form.has_notification"
                      hide-details
                      dense
                      disabled
                    />
                  </column>

                  <column md="4">
                    <v-switch
                      class="switch-label-column"
                      label="Custo baseado nos cadastros"
                      v-model="form.has_cost_product_sales"
                      hide-details
                      dense
                      disabled
                    />
                  </column>
                </v-row>

                <v-row class="mt-5">
                  <column md="4">
                    <v-switch
                      class="switch-label-column"
                      label="Custo baseado em lançamento de dados externos"
                      v-model="form.has_cost_product_register"
                      hide-details
                      dense
                      disabled
                    />
                  </column>

                  <column md="4">
                    <v-switch
                      class="switch-label-column"
                      label="Custo baseado na ordem de produção"
                      v-model="form.has_cost_product_order_production"
                      hide-details
                      dense
                      disabled
                    />
                  </column>

                  <column md="4">
                    <v-switch
                      class="switch-label-column"
                      label="Custo baseado nos lançamentos de estoque"
                      v-model="form.has_cost_product_global"
                      hide-details
                      dense
                      disabled
                    />
                  </column>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <!-- modules -->
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" depressed @click="cancel">Cancelar</v-btn>

        <v-btn
          color="primary"
          :loading="loading"
          depressed
          @click="save(form)"
          :disabled="$v.form.$invalid"
          >Salvar</v-btn
        >
      </v-card-actions>
    </v-card>
  </page>
</template>

<script>
import { mapGetters } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import form from '../mixins/form-component'
export default {
  name: 'CompanyIndex',

  layout: 'dashboard',

  mixins: [form],

  data: () => ({
    loaded: false,
    endpoint: '/api/companies',
    form: {},
    base: {
      options: {
        department_id: null,
        entity_id: null,
      },
    },
    rules: {
      options: {
        department_id: { required },
        entity_id: { required },
      },
    },
  }),

  computed: {
    ...mapGetters('request', ['loading']),
    ...mapGetters('account', { user: 'data' }),
  },

  async fetch() {
    this.loaded = false

    await this.load(this.user.company_used)

    this.loaded = true
  },

  methods: {
    afterLoad(data) {
      const { options, ...old } = data

      return {
        ...old,
        options: !options ? { ...this.base.options } : options,
      }
    },

    beforeSave(data) {
      const { companies = [], report, ...form } = data
      form.bi_url = encodeURI(
        `https://app.powerbi.com/reportEmbed?reportId=94d351a8-dd31-47fd-82ce-905f7e98456b&autoAuth=true&ctid=3f113021-bfc3-41d8-8541-b5727973136e&pageName=ReportSection11&filter=dim_empresas/EmpresaPai eq ` +
          `'` +
          form.name +
          `'`
      )
      return {
        ...form,
        companies: companies.map((h) => h.id),
      }
    },

    async afterSave() {
      await this.$store.dispatch('account/fetch')
    },
  },

  middleware({ redirect, store }) {
    if (!store.getters['account/isAdmin']) {
      redirect('/')
    }
  },
}
</script>

<style lang="scss" scoped></style>
