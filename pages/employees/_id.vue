<template>
  <page>
    <template v-slot:header>
      <breadcrumb :title="title" />
    </template>

    <!-- begin: form -->
    <v-card v-if="loaded">
      <v-card-text>
        <row-info :row="form" v-if="!isNew" />

        <v-row>
          <column md="3">
            <v-text-field
              label="Nome"
              outlined
              dense
              v-model.trim="form.name"
              @input="$v.form.name.$touch()"
              :error-messages="watchErrorMessages('name')"
            />
          </column>

          <column md="2">
            <input-date
              label="Data de Admissão"
              v-model.trim="form.admission_date"
              @input="$v.form.admission_date.$touch()"
              :error-messages="watchErrorMessages('admission_date')"
            />
          </column>

          <column md="2">
            <input-date
              label="Data de Demissão"
              v-model.trim="form.dismissal_date"
              :default-date="false"
              @input="$v.form.dismissal_date.$touch()"
              :error-messages="watchErrorMessages('dismissal_date')"
            />
          </column>

          <column md="3">
            <v-text-field
              label="Email"
              type="email"
              outlined
              dense
              v-model.trim="form.email"
              @input="$v.form.email.$touch()"
              :error-messages="watchErrorMessages('email')"
            />
          </column>

          <column md="2">
            <v-text-field
              label="Telefone"
              outlined
              dense
              v-mask="['(##) ####-####', '(##) #####-####']"
              v-model.trim="masked.phone"
              :error-messages="watchErrorMessages('phone')"
            />
          </column>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-divider class="my-2"></v-divider>
            <v-card flat>
              <v-toolbar flat dense>
                <v-toolbar-title style="font-size: 16px">
                  Salários ({{ form.salaries.length }})
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <nav-items v-slot="{ mobile }">
                  <v-btn :icon="mobile" small outlined @click="addItem">
                    <custom-icon v-if="mobile">add</custom-icon>
                    <span v-else>Gerar +1</span>
                  </v-btn>
                  <v-btn :icon="mobile" small outlined @click="removeItems">
                    <custom-icon v-if="mobile">delete</custom-icon>
                    <span v-else>Remover Todos</span>
                  </v-btn>
                </nav-items>
              </v-toolbar>
              <v-list two-line>
                <v-slide-y-transition group>
                  <v-list-item
                    class="px-0"
                    v-for="(item, index) in $v.form.salaries.$each.$iter"
                    :key="`salary-${index}`"
                  >
                    <v-list-item-content>
                      <v-layout
                        row
                        :class="{ mobile: $vuetify.breakpoint.smAndDown }"
                      >
                        <column md="3">
                          <v-text-field
                            label="Cargo"
                            outlined
                            dense
                            v-model.trim="item.ocupation.$model"
                            @input="item.ocupation.$touch()"
                            :error-messages="
                              watchErrorMessages(`salaries.${index}.ocupation`)
                            "
                          />
                        </column>

                        <column
                          md="6"
                          :class="{ mobile: $vuetify.breakpoint.xs }"
                          class="custom-inputs"
                        >
                          <input-currency
                            v-model="item.remuneration.$model"
                            label="Salário"
                            @input="item.remuneration.$touch()"
                            :error-messages="
                              watchErrorMessages(
                                `salaries.${index}.remuneration`
                              )
                            "
                          />

                          <input-currency
                            v-model="item.charges.$model"
                            label="Encargos"
                            @input="item.charges.$touch()"
                            :error-messages="
                              watchErrorMessages(`salaries.${index}.charges`)
                            "
                          />

                          <input-currency
                            v-model="item.expenses.$model"
                            label="Outras Despesas"
                            @input="item.expenses.$touch()"
                            :error-messages="
                              watchErrorMessages(`salaries.${index}.expenses`)
                            "
                          />

                          <input-currency
                            label="Liquido"
                            :value="liquid(item.$model)"
                            disabled
                          />
                        </column>

                        <column md="2">
                          <input-date
                            label="Inicio da Vigencia"
                            v-model.trim="item.start_date.$model"
                            @input="item.start_date.$touch()"
                            :error-messages="
                              watchErrorMessages(`salaries.${index}.start_date`)
                            "
                          />
                        </column>

                        <column
                          md="1"
                          class="justify-center"
                          :class="{
                            'text-center': $vuetify.breakpoint.smAndDown,
                          }"
                        >
                          <v-btn
                            icon
                            @click="removeItem(item.$model)"
                            class="mr-0"
                          >
                            <custom-icon>delete</custom-icon>
                          </v-btn>
                        </column>
                      </v-layout>
                    </v-list-item-content>
                  </v-list-item>
                </v-slide-y-transition>

                <v-list-item class="px-0" v-if="form.salaries.length <= 0">
                  <v-list-item-content>
                    <alert class="mt-2">
                      <strong>Atenção!</strong>
                      Você pode adicionar um ou mais salários para o
                      funcionário.
                    </alert>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <button-delete
          :endpoint="endpoint"
          :id="form.id"
          v-if="!isNew"
          :restore="!!form.inactive_at"
          @completed="toggleDeleteComponent"
          form-action
        />

        <v-spacer></v-spacer>
        <v-btn outlined @click="cancel">Cancelar</v-btn>

        <v-btn
          color="primary"
          :loading="$store.getters['request/loading']"
          depressed
          @click="save(form)"
          >Salvar</v-btn
        >
      </v-card-actions>
    </v-card>
    <!-- end: form -->
  </page>
</template>

<script>
import { required, minLength, email } from 'vuelidate/lib/validators'
import form from '~/mixins/form-component'
import { sum, uniqueId } from 'lodash'
import { clearPhone } from '~/common'
import { gt, digits_between } from '~/plugins/rules'

export default {
  name: 'EmployeeEdit',

  layout: 'dashboard',

  mixins: [form],

  data: () => ({
    endpoint: '/api/employees',

    base: {
      name: '',
      admission_date: '',
      dismissal_date: '',
      salaries: [],
      phone: '',
    },

    form: {
      salaries: [],
    },

    item: {},

    salaries: [],

    loaded: false,

    masked: {
      phone: '',
    },

    rules: {
      name: { required, minLength: minLength(4) },
      admission_date: { required },
      dismissal_date: {},
      email: {
        email,
      },
      phone: {
        digits_between: digits_between(10, 11),
      },
      salaries: {
        $each: {
          ocupation: { required },
          remuneration: { required, gt: gt(0) },
          expenses: { required },
          charges: { required },
          start_date: { required },
        },
      },
    },
  }),

  computed: {
    title() {
      return this.isNew ? 'Adicionar Funcionário' : 'Editar Funcionário'
    },

    liquid() {
      return (model) => {
        const { remuneration, charges, expenses } = model

        const values = [remuneration, charges, expenses].map(Number)

        return sum(values).toFixed(2)
      }
    },
  },

  watch: {
    'masked.phone': function (value) {
      this.form.phone = clearPhone(value)
      this.$v.form.phone.$touch()
    },
  },

  async fetch() {
    if (!this.isNew) {
      await this.load(this.$route.params.id)
    }

    this.loaded = true
  },

  methods: {
    /**
     * Selecionar produto.
     *
     * @param {*} value
     * @param {*} index
     * @param {*} $v
     */
    selectItem(value, index, $v) {
      if (this.unique[index]) {
        this.unique.splice(index, 1)
      }

      this.unique.push(value)

      $v.$touch()
    },

    /**
     * Adicionar produto.
     */
    addItem() {
      this.form.salaries.push({
        id: uniqueId('draft_'),
        ocupation: '',
        remuneration: 0,
        expenses: 0,
        charges: 0,
        start_date: '',
      })
    },

    /**
     * Remover produto
     *
     * @param {*} item
     */
    removeItem(item) {
      let index = this.form.salaries.findIndex((i) => i.id === item.id)

      if (index === -1) return

      this.form.salaries.splice(index, 1)
    },

    /**
     * Remover lista de items.
     *
     * @returns {void}
     */
    removeItems() {
      this.form.salaries = []
    },

    /**
     * Redefinir formulário
     *
     * @returns {void}
     */
    maskRefresh() {
      this.masked.phone = this.item.phone
    },

    /**
     * Executado apos a atualizaçào/criação ser finalizada com sucesso.
     *
     * @param {*} form
     */
    afterSave(form, created = false) {
      this.cancelled()
    },

    /**
     * Executado apos a atualizaçào/criação ser finalizada com sucesso.
     *
     * @param {*} form
     */
    cancelled() {
      this.$router.push('/employees')
    },
  },

  middleware({ route, redirect }) {
    if (!route.params.id) {
      return redirect('/employees')
    }
  },
}
</script>

<style lang="scss">
.custom-inputs {
  display: flex;
  > div {
    width: 23%;
    margin-top: 0;
    margin-left: 0.5rem;

    &:first-child {
      margin-left: 0;
    }
  }

  &.mobile {
    flex-direction: column;
    padding-top: 0;
    > div {
      width: 100%;
      margin-top: 1.2rem;
      margin-left: 0;
    }
  }

  .layout.row.mobile {
    flex-direction: column;
  }
}
</style>
