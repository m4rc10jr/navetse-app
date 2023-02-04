<template>
  <page>
    <breadcrumb
      slot="header"
      title="Contas"
      has-filter
      @filter:sync="syncFilter"
      @filter:close="cancelFilter"
      @search="$bus.$emit('dynamic-list:fetch', $event)"
      :options="filter"
      :search-options="{
        placeholder: 'ID ou Titulo',
      }"
    >
      <template v-slot:filters>
        <v-layout>
          <v-col cols md="3">
            <select-default
              label="Tipos"
              v-model="filter.column.type"
              :items="filter.data.types"
            />
          </v-col>
        </v-layout>
      </template>
    </breadcrumb>

    <dynamic-list v-model="api" @edit="openDialog" icon="account_balance">
      <template v-slot:item="{ item }">
        <v-list-item-title>{{ item.title }}</v-list-item-title>
        <v-divider class="my-1" dark></v-divider>
        <v-list-item-subtitle>
          <chip>{{ item.description }}</chip>
        </v-list-item-subtitle>
      </template>
    </dynamic-list>

    <button-add @click="openDialog" />

    <modal @close="closeDialog" v-model="dialog" :is-new="!item.id">
      <account-form
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
  name: 'AccountIndex',

  layout: 'dashboard',

  mixins: [dialog, filter],

  components: {
    accountForm: () => import('./components/AccountForm'),
  },

  data: () => ({
    api: {
      endpoint: '/api/accounts',
      filter: {
        with: 'all',
      },
    },

    item: {},

    filter: {
      column: {
        type: null,
      },

      data: {
        types: [],
      },

      collection: 'account',
    },
  }),
}
</script>

<style lang="scss" scoped></style>
