<template>
  <page>
    <breadcrumb slot="header" :title="title" />

    <v-card :disabled="loading" v-if="loaded">
      <v-card-text class="pb-0">
        <v-fade-transition>
          <row-info :row="form" v-if="!isNew" key="system_info" />
        </v-fade-transition>

        <v-row
          :class="{ 'mt-2': isNew, mobile: $vuetify.breakpoint.smAndDown }"
          class="main-form mb-0"
        >
          <column md="3">
            <input-date
              label="Data"
              v-model="form.date"
              @input="$v.form.date.$touch"
              :error-messages="watchErrorMessages('date')"
            />
          </column>

          <column md="3">
            <select-item
              v-model="form.item_id"
              :limit="10"
              :data="[{ ...form.item }]"
              :error-messages="watchErrorMessages('item_id')"
              @change="updateItem"
              v-if="loaded"
            />
          </column>

          <column md="2">
            <input-text
              label="Unidade"
              :value="form.item.unit.title"
              :options="{ disabled: true }"
            />
          </column>

          <column md="2">
            <v-text-field
              label="Quantidade"
              v-model="form.quantity"
              outlined
              dense
              type="number"
              :error-messages="watchErrorMessages('quantity')"
              @input="$v.form.quantity.$touch"
            />
          </column>

          <column md="2">
            <input-currency
              label="Valor por Item"
              v-model="form.cost"
              :error-messages="watchErrorMessages('cost')"
              @input="$v.form.cost.$touch"
            />
          </column>

          <column md="2">
            <v-text-field
              label="Valor Total"
              :value="total | brl"
              outlined
              disabled
              dense
            />
          </column>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <button-delete
          :id="form.id"
          :endpoint="endpoint"
          v-if="!isNew"
          @completed="toggleDeleteComponent"
          form-action
          :restore="!!form.inactive_at"
        />
        <v-spacer></v-spacer>
        <v-btn depressed @click="reset">Cancelar</v-btn>
        <v-btn color="primary darken-1" depressed @click="save(form)"
          >Salvar</v-btn
        >
      </v-card-actions>
    </v-card>
  </page>
</template>

<script>
import { mapGetters } from 'vuex'
import { gte } from '~/plugins/rules'
import form from '~/mixins/form-component'
import { required } from 'vuelidate/lib/validators'

export default {
  name: 'StockForm',

  mixins: [form],

  layout: 'dashboard',

  data: () => ({
    endpoint: '/api/products',

    loaded: false,

    base: {
      id: null,
      date: null,
      cost: 0,
      quantity: 1,
      total: 0,
      item_id: null,
      item: {
        id: null,
        title: null,
        unit: {},
      },
    },

    rules: {
      quantity: {
        required,
        gte: gte(0.01),
      },
      cost: {
        required,
        gte: gte(0.01),
      },
      date: {
        required,
      },
      item_id: {
        required,
      },
    },
  }),

  computed: {
    title() {
      return this.isNew ? 'Adicionar Estoque' : 'Editar Estoque'
    },

    total() {
      const { cost = 0, quantity = 0 } = this.form

      return Number(quantity) * Number(cost)
    },

    ...mapGetters({
      user: 'account/data',
      loading: 'request/loading',
    }),
  },

  methods: {
    async fetch() {
      const row = await this.$axios.$get(
        `${this.endpoint}/${this.$route.params.id}`
      )

      row.item_id = row.item.id
      this.item = { ...row }

      this.item.date = this.$helper.formatDate(row.date, 'YYYY-MM-DD')
    },

    updateItem(item) {
      this.form.item_id = item?.id
      this.$v.form.item_id.$touch()

      if (Object.entries(item).length === 0) {
        return
      }

      this.form.item = item
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
      this.$router.push('/stocks')
    },
  },

  async created() {
    this.reset()

    if (this.$route.params.id !== 'create') {
      await this.fetch()
    }

    this.loaded = true
  },
}
</script>

<style lang="scss"></style>
