<template>
  <page>
    <breadcrumb
      slot="header"
      title="Sub Contas"
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
          <v-col cols md="4">
            <select-dynamic
              label="Conta"
              v-model="filter.column.account"
              endpoint="/api/accounts"
              item-text="title"
              :select-options="{
                hideDetails: true,
              }"
              :api-options="{
                select: 'id,title',
              }"
            />
          </v-col>

          <v-col cols md="3">
            <select-default
              label="Grupos"
              :items="filter.data.groups"
              v-model="filter.column.group"
            />
          </v-col>
        </v-layout>
      </template>
    </breadcrumb>

    <dynamic-list
      v-model="api"
      @edit="openDialog"
      icon="account_balance_wallet"
    >
      <template v-slot:item="{ item }">
        <v-list-item-title>{{ item.title }}</v-list-item-title>
        <v-divider class="my-1" dark></v-divider>
        <v-list-item-subtitle v-if="item.account">
          <chip>{{ item.account.title }}</chip>
          <v-divider dark vertical></v-divider>
          <chip>{{ item.group }}</chip>
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
  name: 'SubAccountIndex',

  layout: 'dashboard',

  mixins: [dialog, filter],

  components: {
    accountForm: () => import('./components/SubAccountForm'),
  },

  data: () => ({
    api: {
      endpoint: '/api/sub-account?account[load]=*',
      filter: {
        with: 'all',
      },
    },

    item: {},

    filter: {
      column: {
        account: null,
        group: null,
      },

      collection: 'sub-account',

      data: {
        groups: [],
      },
    },

    mapItem: {
      id: 'id',
      account_id: 'account.id',
      title: 'title',
      group: 'group',
      dre_calc: 'dre_calc',
      dfc_calc: 'dfc_calc',
      created_at: 'created_at',
      updated_at: 'updated_at',
    },
  }),
}
</script>
