<template>
  <page>
    <breadcrumb :title="title" slot="header" />

    <!-- begin: form -->
    <v-card v-if="loaded">
      <v-card-text>
        <row-info :row="form" v-if="!isNew" />

        <v-row :class="{ mobile: isMobile }">
          <column md="2">
            <v-autocomplete
              :items="typesFiltered"
              v-model.trim="form.type"
              :error-messages="watchErrorMessages('type')"
              @change="$v.form.type.$touch()"
              label="Tipo"
              outlined
              hide-details
              dense
              :disabled="disableType"
            />
          </column>

          <column md="10">
            <input-text
              label="Titulo"
              v-model.trim="form.title"
              @input="$v.form.title.$touch()"
              :error-messages="watchErrorMessages('title')"
            />
          </column>

          <column md="4" v-if="isProviderRequired">
            <select-entity
              label="Fornecedor(a)"
              only-provider
              v-model="form.entity_id"
              @input="$v.form.entity_id.$touch()"
              :error-messages="watchErrorMessages('entity_id')"
            />
          </column>

          <column md="4">
            <input-text
              label="Grupo"
              v-model.trim="form.group"
              @input="$v.form.group.$touch()"
              :error-messages="watchErrorMessages('group')"
            />
          </column>

          <column md="2">
            <select-unit
              load-data
              v-model="form.unit_id"
              @change="updateUnit"
              :valid="$v.form.unit_id.$dirty"
              :error-messages="watchErrorMessages('unit_id')"
            />
          </column>

          <column md="2">
            <input-currency
              v-model="form.suggested_price"
              label="Preço Sugerido"
              @input="$v.form.suggested_price.$touch()"
              :error-messages="watchErrorMessages('suggested_price')"
            />
          </column>

          <column md="2">
            <input-currency
              v-model="form.cost"
              label="Custo"
              @input="$v.form.cost.$touch()"
              :error-messages="watchErrorMessages('cost')"
            />
          </column>

          <column md="2" v-if="form.type !== 'input'">
            <input-currency
              :value="
                form.cost + (form.products.reduce((a, b) => a + b.cost, 0) || 0)
              "
              label="Custo Final Geral"
              disabled
            />
          </column>
        </v-row>

        <!-- <v-layout row class="mt-5">

        </v-layout> -->

        <v-divider class="my-2"></v-divider>

        <v-list two-line v-if="form.type && form.type !== 'input'">
          <v-list-item class="px-0">
            <v-list-item-content>
              <v-list-item-title>Associar Items</v-list-item-title>
            </v-list-item-content>

            <v-list-item-action>
              <nav-items v-slot="{ mobile }">
                <v-btn :icon="mobile" small outlined @click="addProduct">
                  <custom-icon v-if="mobile">add</custom-icon>
                  <span v-else>Gerar +1</span>
                </v-btn>
                <v-btn :icon="mobile" small outlined @click="removeProducts">
                  <custom-icon v-if="mobile">delete</custom-icon>
                  <span v-else>Remover Todos</span>
                </v-btn>
              </nav-items>
            </v-list-item-action>
          </v-list-item>

          <v-slide-y-transition group>
            <v-list-item
              v-for="(product, index) in $v.form.products.$each.$iter"
              :key="`product-${index}`"
              :class="{ invalid: product.$invalid, 'mt-1': index > 0 }"
              class="pl-0"
            >
              <v-list-item-action class="mr-0 pl-2">
                <v-slide-x-reverse-transition mode="out-in" duration="200">
                  <custom-icon
                    style="color: red"
                    v-if="product.$invalid"
                    :key="`error.{index}`"
                    >error</custom-icon
                  >
                  <custom-icon v-else :key="`done.${index}`"
                    >shopping_cart</custom-icon
                  >
                </v-slide-x-reverse-transition>
              </v-list-item-action>

              <v-list-item-content class="py-2">
                <v-layout>
                  <column md="3">
                    <select-dynamic
                      :label="`Item ${Number(index) + 1}`"
                      no-api-data
                      :data="products"
                      item-text="title"
                      :error-messages="
                        watchErrorMessages(
                          `products.${index}.raw_item_id`,
                          'produto'
                        )
                      "
                      v-model.trim="product.raw_item_id.$model"
                      @input="product.raw_item_id.$touch"
                      @change="(e) => selectItem(e, product)"
                      :select-options="{ hideDetails: true }"
                    />
                  </column>

                  <column md="3">
                    <input-text
                      label="Unidade"
                      :options="{
                        hideDetails: true,
                      }"
                      disabled
                      :value="product.unit_title.$model"
                    />
                  </column>

                  <column md="2">
                    <input-text
                      v-model.trim="product.quantity.$model"
                      @input="product.quantity.$touch"
                      label="Quantidade"
                      :options="{
                        type: 'number',
                      }"
                      :error-messages="
                        watchErrorMessages(
                          `products.${index}.quantity`,
                          null,
                          'Quantidade inválida'
                        )
                      "
                    />
                  </column>

                  <column md="2">
                    <input-currency
                      label="Custo"
                      :value="product.subtotal.$model"
                      disabled
                    />
                  </column>

                  <column md="2">
                    <div class="d-flex flex-row">
                      <v-btn
                        icon
                        @click.stop="removeProduct(product.$model, index)"
                        class="mr-0"
                      >
                        <custom-icon>delete</custom-icon>
                      </v-btn>
                    </div>
                  </column>
                </v-layout>
              </v-list-item-content>
            </v-list-item>
          </v-slide-y-transition>

          <v-list-item v-if="form.products.length > 0" class="pt-2">
            <v-list-item-action class="mr-0"></v-list-item-action>
            <v-list-item-content>
              <input-currency
                label="Sub Total"
                :value="form.products.reduce((a, b) => a + b.cost, 0) || 0"
                disabled
                style="max-width: 178px"
              />
            </v-list-item-content>
          </v-list-item>

          <v-fade-transition>
            <v-list-item
              class="pa-0"
              v-if="form.products && form.products.length <= 0"
              key="empty"
            >
              <v-list-item-content class="pa-0">
                <alert type="info" :options="{ outlined: true }">
                  Itens do tipo <b>insumo</b> podem ser associados a este item.
                </alert>
              </v-list-item-content>
            </v-list-item>
          </v-fade-transition>
        </v-list>
      </v-card-text>

      <v-card-actions>
        <button-delete
          :endpoint="endpoint"
          :id="form.id"
          v-if="!isNew"
          form-action
          :restore="!!form.inactive_at"
          @completed="toggleDeleteComponent"
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
import { required, minLength, requiredIf } from 'vuelidate/lib/validators'
import { unique, gte } from '~/plugins/rules'
import form from '/mixins/form-component'
import { mapGetters } from 'vuex'

export default {
  name: 'RecordItem',

  layout: 'dashboard',

  mixins: [form],

  data: () => ({
    endpoint: '/api/items',

    selected: -1,

    base: {
      title: null,
      unit_id: null,
      entity_id: null,
      group: null,
      type: null,
      cost: 0,
      suggested_price: 0,
      products: [],
      inactive_at: null,
    },

    products: [],

    loaded: false,

    types: [
      { text: 'Produto', value: 'product' },
      { text: 'Serviço', value: 'service' },
      { text: 'Insumo', value: 'input' },
    ],

    rules: {
      title: { required, minLength: minLength(3) },
      group: { minLength: minLength(4) },
      type: { required, minLength: minLength(4) },
      cost: {
        required: requiredIf((vm) => vm.type === 'service'),
      },
      suggested_price: {
        gte: gte(0),
      },
      unit_id: { required },
      entity_id: {
        required: requiredIf((vm) => ['input', 'product'].includes(vm.type)),
      },
      products: {
        $each: {
          raw_item_id: {
            required,
            unique: unique('unique'),
          },
          quantity: { required },
          cost: {},
          unit_title: {},
          subtotal: {},
        },
      },
    },
  }),

  computed: {
    title() {
      return this.isNew ? 'Adicionar Item de Venda' : 'Editar Item de Venda'
    },

    typesFiltered() {
      if (!this.isNew && this.form.type !== 'input') {
        return this.types.filter((type) => type.value !== 'input')
      }

      return this.types
    },

    disableType() {
      if (this.isNew) return false

      return this.form.type === 'input'
    },

    getCostProduct() {
      return (item) => {
        const product =
          this.products.find((h) => h.id === item.raw_item_id) || {}

        const { last_product_entry = {} } = product
        const quantity = Number(item.quantity) ?? 0

        if (
          !product ||
          !last_product_entry ||
          (last_product_entry && Object.entries(last_product_entry).length <= 0)
        ) {
          return item.cost * quantity
        }

        return quantity > 0
          ? (quantity / last_product_entry.quantity) *
              last_product_entry.cost_total
          : 0
      }
    },

    getCostProducts() {},

    isProviderRequired() {
      return ['input', 'product'].includes(this.form.type)
    },

    ...mapGetters('account', {
      mainCompany: 'companyInUse',
    }),
  },

  watch: {
    'form.products': {
      deep: true,
      handler(products) {
        this.syncFormProducts(products)
      },
    },

    isProviderRequired(value) {
      if (this.isNew && this.mainCompany?.options) {
        this.form.entity_id = this.mainCompany.options?.entity_id
        this.$forceUpdate()
      }
    },
  },

  async fetch() {
    await this.fetchProducts()

    if (!this.isNew) {
      await this.load(this.$route.params.id, {
        'product[load]': true,
      })
    }

    this.loaded = true
  },

  methods: {
    /**
     *
     * @param {*} response
     */
    afterLoad(response) {
      const { products = [], ...item } = response

      return {
        ...item,
        unit_id: item.unit.id,
        entity_id: item?.entity?.id,
        products: this.syncFormProducts(products),
      }
    },

    /**
     * Atualiza unidade selecionada no componente filho.
     *
     * @param {*} item
     */
    updateUnit(item) {
      this.form.unit_id = item.id
      this.form.unit = { ...item }
      this.$v.form.unit_id.$touch()
    },

    /**
     * Item selecionado no menu de sub-items.
     *
     * @param {*} item
     */
    selectItem(item, input) {
      if (!item) return

      Object.assign(input.$model, {
        cost: 0,
        quantity: 1,
        unit_title: null,
        subtotal: 0,
      })

      const { last_product_entry = {} } = item
      const quantity = last_product_entry?.quantity ?? 1
      const cost = last_product_entry?.cost ?? item.cost ?? 0

      Object.assign(input.$model, {
        cost,
        quantity,
        unit_title: item.unit.title,
        subtotal: 0,
      })

      input.$touch()
    },

    /**
     * Carregar items do tipo insumo.
     *
     * @returns {void}
     */
    async fetchProducts() {
      try {
        const params = {
          select: 'id,unit_id,title,group,cost,type',
          'scope[input]': true,
          'orderBy[id]': 'desc',
          'includes[unit]': 'title,symbol',
          'includes[this]': 'last_product_entry',
        }

        if (!this.isNew) {
          params['whereNotIn[id]'] = this.$route.params.id
        }

        const data = await this.$axios.$get('/api/items', { params })

        this.products = data
      } catch (e) {
        this.$notify.error('Falha ao buscar produtos')
      }
    },

    /**
     * Selecionar produto.
     *
     * @param {*} value
     * @param {*} index
     * @param {*} $v
     */
    selectProduct(value, index, $v) {
      if (this.unique[index]) {
        this.unique.splice(index, 1)
      }

      this.unique.push(value)

      $v.$touch()
    },

    /**
     * Adicionar produto.
     */
    addProduct() {
      this.form.products.push({
        id: unique('rascunho_'),
        raw_item_id: null,
        quantity: 1,
        subtotal: 0,
        cost: 0,
      })
    },

    /**
     * Remover produto
     *
     * @param {*} item
     */
    removeProduct(item) {
      let index = this.form.products.findIndex((i) => i.id === item.id)

      index > -1 && this.form.products.splice(index, 1)
    },

    /**
     * Remover lista de sub-items.
     *
     * @returns {void}
     */
    removeProducts() {
      if (!confirm('Tem certeza?')) {
        return
      }

      this.form.products = []
    },

    /**
     * Obter sugestão de preço.
     */
    async getSuggestedPrice(id) {
      const response = await this.$axios.$get(
        `/api/items/${id}/suggested_price`
      )

      return response
    },

    /**
     * @param {*} form
     */
    beforeSave(form) {
      const { products = [], entity = {}, unit = {}, ...old } = form

      return {
        ...old,
        products,
        entity_id: entity?.id ?? form.entity_id,
        unit_id: unit?.id ?? form.unit_id,
      }
    },

    /**
     * Executado apos a atualizaçào/criação ser finalizada com sucesso.
     *
     * @param {*} form
     */
    afterSave(form, created = false) {
      // this.original = cloneDeep({ ...form })
      this.cancelled()
    },

    /**
     * Executado apos ser cancelado
     *
     * @param {*} form
     */
    cancelled() {
      this.$router.push('/records/item')
    },

    /**
     * @param {*} products
     */
    syncFormProducts(products) {
      for (let row of products) {
        const productSelected = this.products.find(
          (h) => h.id === row.raw_item_id
        )
        const last_product_entry =
          productSelected?.last_product_entry ?? row?.last_product_entry

        const quantity = row?.quantity ?? productSelected?.quantity ?? 1
        const lastProductEntryQuantity = last_product_entry?.quantity ?? 1
        const lastProductEntryCostTotal =
          last_product_entry?.cost_total ?? productSelected?.cost ?? 0

        row.subtotal =
          quantity > 0
            ? (quantity / lastProductEntryQuantity) * lastProductEntryCostTotal
            : 0
      }

      return products
    },
  },

  middleware({ route, redirect }) {
    if (!route.params.id) {
      return redirect('/records/item')
    }
  },

  async created() {
    this.reset()
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
