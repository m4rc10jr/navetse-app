<template>
  <v-card flat>
    <v-divider class="pt-1 mt-3"></v-divider>
    <v-toolbar dense flat>
      <v-toolbar-title style="font-size: 16px"
        >Detalhamento por Item ({{ form.length }})</v-toolbar-title
      >
      <v-spacer></v-spacer>
      <nav-items v-slot="{ mobile }">
        <v-btn :icon="mobile" small outlined @click="add">
          <custom-icon v-if="mobile">add</custom-icon>
          <span v-else>Gerar +1</span>
        </v-btn>
        <v-btn :icon="mobile" small outlined @click="removeAll">
          <custom-icon v-if="mobile">delete</custom-icon>
          <span v-else>Remover Todos</span>
        </v-btn>
      </nav-items>
    </v-toolbar>

    <v-list two-line>
      <v-list-item-group v-model="selected" active-class="actived">
        <v-slide-y-transition group>
          <v-list-item
            class="px-0"
            v-for="(item, index) in orderRecords"
            :key="index"
            @click="edit(item, index)"
            :class="{
              invalid: $v.form.$each.$iter[index].$invalid,
              'mt-2': index > 0,
            }"
          >
            <v-list-item-action>
              <div class="ml-1">
                <v-slide-x-reverse-transition mode="out-in" duration="200">
                  <custom-icon
                    style="color: red"
                    v-if="$v.form.$each.$iter[index].$invalid"
                    :key="`error.{index}`"
                    >error</custom-icon
                  >
                  <custom-icon v-else :key="`done.${index}`"
                    >list_alt</custom-icon
                  >
                </v-slide-x-reverse-transition>
              </div>
            </v-list-item-action>

            <v-list-item-content>
              <v-list-item-title
                >{{ item.title || '{Produto}' }} ({{
                  item.unit_symbol || '{Simbolo}'
                }})</v-list-item-title
              >
              <v-list-item-subtitle>{{
                item.department_title || '{Departamento}'
              }}</v-list-item-subtitle>
              <v-list-item-subtitle>
                <span
                  >{{ item.quantity }}x <b>{{ item.cost | brl }}</b></span
                >
              </v-list-item-subtitle>

              <v-list-item-subtitle
                class="mt-1"
                v-if="!item.delivery_date && hasSale"
              >
                <v-chip label x-small color="error" outlined
                  >Não Entregue</v-chip
                >
              </v-list-item-subtitle>

              <v-list-item-subtitle
                v-if="draft.includes(item.ref)"
                class="mt-1"
              >
                <small>* você tem edições não salvas nesse item.</small>
              </v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action>
              <v-layout row class="mr-1">
                <v-btn icon @click.stop="remove(item, index)" class="mr-0">
                  <custom-icon>delete</custom-icon>
                </v-btn>
              </v-layout>
            </v-list-item-action>
          </v-list-item>
        </v-slide-y-transition>
      </v-list-item-group>

      <v-list-item key="empty" class="pl-0" v-if="form.length === 0">
        <v-list-item-content>
          <alert type="info" :options="{ outlined: true }">
            Nenhum item foi adicionado.
          </alert>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <!-- BEGIN: installment -->
    <modal v-if="dialog" v-model="dialog" @close="closeDialog" width="60vw">
      <v-toolbar-title slot="header"
        >Item #{{ currentIndexOf + 1 }}</v-toolbar-title
      >
      <pre>{{ itemsFiltered }}</pre>
      <v-card flat>
        <v-card-text class="pt-3">
          <!-- begin: form -->
          <v-row>
            <column md="4">
              <select-dynamic
                label="Setor"
                v-model="input.department_id.$model"
                no-api-data
                :data="departments"
                :api-options="{ limit: 10, select: 'id,title' }"
                :error-messages="
                  watchErrorMessages(`self.${currentIndexOf}.department_id`)
                "
                item-text="title"
              />
            </column>

            <column md="8">
              <select-dynamic
                label="Item ou Cod do Item"
                v-model="input.item_id.$model"
                :error-messages="
                  watchErrorMessages(`self.${currentIndexOf}.item_id`)
                "
                :data="itemsMultable"
                :item-text="(h) => `${h.id} - ${h.title}`"
                @change="selectItem"
                no-api-data
                filter-by-value
              />
            </column>
          </v-row>

          <v-row class="mt-5">
            <column md="4">
              <v-text-field
                label="Quantidade"
                v-model="input.quantity.$model"
                :error-messages="
                  watchErrorMessages(`self.${currentIndexOf}.quantity`)
                "
                dense
                outlined
                type="number"
                min="0"
              />
            </column>

            <column md="4">
              <input-currency
                label="Valor Praticado"
                v-model="input.cost.$model"
                :error-messages="
                  watchErrorMessages(`self.${currentIndexOf}.cost`)
                "
              />
            </column>

            <column md="4">
              <input-text
                label="Total"
                :value="(model.quantity * model.cost) | brl"
                disabled
              />
            </column>

            <column md="4" v-if="hasSale">
              <input-date
                label="Data Entrega"
                :default-date="false"
                v-model="input.delivery_date.$model"
                :error-messages="
                  watchErrorMessages(`self.${currentIndexOf}.delivery_date`)
                "
              />
            </column>
          </v-row>
          <!-- end:form -->
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn depressed color="error" @click="reset(input)">
            Cancelar
          </v-btn>
          <v-btn color="primary" depressed @click="createOrUpdate(input)">
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </modal>
  </v-card>
</template>

<script>
import validate from '~/mixins/validate'
import { required } from 'vuelidate/lib/validators'
import { gte, gt } from '~/plugins/rules'
import dialog from '~/mixins/dialog'
import { cloneDeep, omitBy, uniqueId } from 'lodash'
import { mapGetters } from 'vuex'

export default {
  name: 'EditorItem',

  mixins: [validate, dialog],

  props: {
    rows: {
      type: Array,
      default: () => [],
    },

    type: {
      required: true,
      type: String,
      default: 'sale',
    },

    hasSale: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    selected: null,

    base: {
      id: null,
      ref: null,
      item_id: null,
      unit_id: null,
      unit_title: null,
      unit_symbol: null,
      item_cost: 0,
      department_id: null,
      department_title: null,
      code: null,
      title: '',
      quantity: 0,
      cost: 0,
      total: 0,
      delivery_date: null,
    },

    form: [],

    editorForm: {},

    currentIndexOf: -1,

    newRecords: [],

    draft: [],

    rowsMultable: [],
  }),

  watch: {
    dialog(value) {
      if (!value) {
        this.currentIndexOf = -1
      }
    },

    form: {
      deep: true,
      handler(form) {
        for (let row of form) {
          row.total = row.quantity * row.cost

          const department = this.departments.find(
            (h) => h.id === row.department_id
          )
          const item = this.items.find((h) => h.id === row.item_id)

          if (!row.department_title && department) {
            row.department_title = department.title
          }

          if (!item) {
            return
          }

          row.title = item.title
          row.unit_symbol = item.unit.symbol
          row.unit_title = item.unit.title
        }
      },
    },

    '$v.form.$invalid'(value) {
      this.$emit('valid', !value)
    },
  },

  validations() {
    const form = {
      $each: {
        department_id: {
          required,
        },
        item_id: {
          required,
        },
        quantity: {
          required,
          gt: gt(0),
        },
        cost: {
          required,
          gte: gte(0.01),
        },
        delivery_date: {},
      },
    }

    if (!this.hasSale) {
      delete form.$each.delivery_date
    }

    return { form }
  },

  computed: {
    lastIndex() {
      return this.form.length - 1
    },

    lastItem() {
      return (
        this.form.orderRecords[0] ?? {
          ...this.base,
        }
      )
    },

    orderRecords() {
      return this.form.sort((a, b) => a.ref - b.ref)
    },

    input() {
      return this.$v.form.$each.$iter[this.currentIndexOf]
    },

    model() {
      return this.form[this.currentIndexOf]
    },

    itemsMultable() {
      return [...this.items]
    },

    itemsFiltered() {
      console.log(this.model.department_id, this.itemsMultable)
      return [...this.itemsMultable].filter(
        (item) => item.department_id === this.model.department_id
      )
    },

    getOriginalById() {
      return (id) => this.original.find((h) => h.id === id) ?? { ...this.base }
    },

    ...mapGetters({
      departments: 'resources/departments',
      items: 'resources/items',
      mainCompany: 'account/companyInUse',
    }),
  },

  methods: {
    selectItem(item) {
      try {
        if (!Object.entries(item).length) {
          console.warn('-= onSelectItem =- item is empty', [item])
          return
        }

        const cost =
          this.type === 'production_order'
            ? item?.last_product_entry?.cost || 0
            : item?.suggested_price

        this.input.$model.cost = cost
        this.input.cost.$touch()
      } catch (e) {
        console.warn('falhou ao selecionar produto', e)
      }
    },
    /**
     * Adicionar.
     *
     * @returns {void}
     */
    add() {
      const item = {
        ...this.base,
        ref: uniqueId('rascunho_'),
      }

      this.form.push({
        ...item,
        department_id: this.mainCompany?.options?.department_id,
      })

      //* adicionar a lista de novos
      this.newRecords.push(item.ref)

      this.draft.push(item.ref)

      this.currentIndexOf = this.lastIndex

      this.dialog = true
    },

    /**
     * Editar.
     *
     * @param {*} item
     * @param {*} index
     * @returns {void}
     */
    edit(item, index) {
      this.dialog = true

      // adicionar ao rascunho.
      this.draft.push(item.ref)

      this.currentIndexOf = index
    },

    /**
     * Remover linha.
     *
     * @returns {void}
     */
    remove(item, index, confirmed = false) {
      if (!confirmed && !confirm('Remover item?')) {
        return
      }

      const remove = this.newRecords.indexOf(item.ref)

      remove > -1 && this.newRecords.splice(remove, 1)

      this.form.splice(index, 1)

      this.emitUpdateForm()
    },

    /**
     * Remover todos registros.
     *
     * @returns {void}
     */
    removeAll() {
      if (!confirm('Remover todos os itens?')) {
        return
      }

      this.form = []
      this.$v.form.$reset()
      this.emitUpdateForm()
    },

    /**
     * Sincronizar.
     *
     * @returns {void}
     */
    createOrUpdate(input) {
      try {
        input.$touch()

        if (input.$invalid) {
          this.$notify.error('Preencha todos os campos obrigatórios')
          return
        }

        this.draft = this.draft.filter((h) => h !== input.$model.ref)

        this.dialog = false

        this.emitUpdateForm()
      } catch (e) {
        this.$notify.error('Erro inesperado!', {
          description: [e?.message],
        })
      }
    },

    /**
     * Carregar tipos de pagamento.
     *
     * @returns {void}
     */
    async fetchDepartments() {
      await this.$store.dispatch('resources/fetch', {
        resource: 'department',
        force: true,
      })
    },

    /**
     * Carregar tipos de pagamento.
     *
     * @returns {void}
     */
    async fetchItems() {
      await this.$store.dispatch('resources/fetch', {
        resource: 'item',
        options: {
          limit: 20,
          'includes[this]': 'last_product_entry',
        },
        force: true,
      })
    },

    /**
     * Remover colunas não mapeadas.
     *
     * @param {*} form
     * @returns {*}
     */
    filterForm(form) {
      return form.map((h) => this.removeUnused(h))
    },

    /**
     * Retorna colunas não mapeadas no objeto.
     *
     * @param {*} item
     */
    removeUnused(item) {
      return omitBy(item, (value, key) => !Object.keys(this.base).includes(key))
    },

    /**
     * Enviar alterações ao componente pai.
     *
     * @returns {void}
     */
    emitUpdateForm() {
      this.$emit(
        'input',
        this.filterForm(this.form).filter(
          (h, index) => this.$v.form.$each.$iter[index].$dirty
        )
      )
    },

    /**
     * Sincronizar informações para montagem do componente.
     *
     * @returns {void}
     */
    update() {
      this.original = cloneDeep([...this.rows])

      this.form = this.rowsMultable.map((h, index) => {
        return {
          ...h,
          ref: uniqueId('rascunho_'),
        }
      })

      this.$v.form.$reset()
      this.$v.form.$touch()

      this.$emit('valid', !this.$v.form.$invalid)
    },

    /**
     * Redefinir dados.
     *
     * @param {*} input
     */
    reset(input) {
      const original = this.getOriginalById(input.$model.id)

      const [newRecordIndex, draftIndex] = [
        this.newRecords.indexOf(this.model.ref),
        this.draft.indexOf(this.model.ref),
      ]

      Object.assign(input.$model, { ...original })

      draftIndex > -1 && this.draft.splice(draftIndex, 1)

      if (newRecordIndex !== -1) {
        this.remove(original, this.currentIndexOf, true)
      }

      input.$reset()

      this.closeDialog()
    },
  },

  async created() {
    //* carregar departamentos.
    await Promise.all([this.fetchDepartments(), this.fetchItems()])
  },

  mounted() {
    this.rowsMultable = [...this.rows]
    this.update()

    this.$bus.$on('editor:item:sync', (items, cancel = false) => {
      this.rowsMultable = items
      this.update()

      if (!cancel) return

      this.newRecords = []
      this.draft = []
    })
  },

  beforeDestroy() {
    this.$bus.$off('editor:item:sync')
  },
}
</script>

<style lang="scss" scoped>
.actived {
  background-color: transparent;
  &::before {
    opacity: 0;
  }
}

.invalid {
  border: 1px solid red;
}
</style>
