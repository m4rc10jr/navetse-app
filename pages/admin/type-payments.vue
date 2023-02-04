<template>
  <page>
    <breadcrumb
      slot="header"
      title="Tipos de Pagamento"
      has-filter
      @filter:sync="syncFilter"
      @filter:close="cancelFilter"
      @search="$bus.$emit('dynamic-list:fetch', $event)"
      :options="filter"
      :search-options="{
        placeholder: 'ID ou Tipo',
      }"
    ></breadcrumb>

    <dynamic-list v-model="api" @edit="openDialog" icon="payments">
      <template v-slot:item="{ item }">
        <v-list-item-title>
          <span>{{ item.title }}</span>
          <span>({{ item.is_payment_on_time ? 'À vista' : 'À prazo' }})</span>
        </v-list-item-title>
        <v-divider class="my-1" dark></v-divider>
        <v-list-item-subtitle>
          <chip :color="item.has_document ? 'primary' : 'grey'">{{
            item.has_document ? 'Documento Obrigatório' : 'Não Requer Documento'
          }}</chip>
        </v-list-item-subtitle>
      </template>
    </dynamic-list>

    <button-add @click="openDialog" />

    <modal @close="closeDialog" v-model="dialog" :is-new="!item.id">
      <payment-form
        :data="item"
        @saved="(event) => $bus.$emit('dynamic-list:sync', event)"
        @cancel="closeDialog"
        v-if="dialog"
      />
    </modal>
  </page>
</template>

<script>
import dialog from '~/mixins/dialog'
import filter from '~/mixins/filter'

export default {
  name: 'TypePaymentIndex',

  layout: 'dashboard',

  mixins: [dialog, filter],

  components: {
    paymentForm: () => import('./components/TypePaymentForm.vue'),
  },

  data: () => ({
    api: {
      endpoint: '/api/type-payment',
      filter: {
        with: 'all',
      },
    },

    filter: {
      column: {},

      collection: null,

      data: {},
    },

    item: {},
  }),
}
</script>

<style lang="scss" scoped></style>
