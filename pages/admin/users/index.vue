<template>
  <page>
    <breadcrumb
      slot="header"
      title="Usuários"
      has-filter
      @filter:sync="syncFilter"
      @filter:close="cancelFilter"
      @search="$bus.$emit('dynamic-list:fetch', $event)"
      :options="filter"
      :search-options="{
        placeholder: 'ID, Nome ou Email',
      }"
    >
      <template v-slot:filters>
        <v-layout>
          <v-col cols md="3">
            <select-dynamic
              label="Empresa"
              v-model="filter.column.company"
              endpoint="/api/companies?select=id,name"
              text-value="name"
              :select-options="{
                hideDetails: true,
              }"
            />
          </v-col>
        </v-layout>
      </template>
    </breadcrumb>

    <dynamic-list v-model="api" @edit="openDialog" icon="manage_accounts">
      <template v-slot:item="{ item }">
        <v-list-item-title>{{ item.name }}</v-list-item-title>
        <v-divider class="my-1" dark></v-divider>
        <v-list-item-subtitle>{{ item.email }}</v-list-item-subtitle>
        <v-list-item-subtitle class="mt-1">
          <v-chip
            small
            label
            color="primary darken-1"
            outlined
            v-if="item.company"
            >{{ item.company.name }}</v-chip
          >

          <v-chip small label color="error darken-3" outlined v-else
            >Administrador</v-chip
          >

          <chip v-if="item.has_report" color="primary">Relatório Ativo</chip>
        </v-list-item-subtitle>
      </template>
    </dynamic-list>

    <button-add @click="openDialog" />

    <modal
      @close="closeDialog"
      v-model="dialog"
      :is-new="!item.id"
      v-if="dialog"
    >
      <user-form
        :data="item"
        @saved="$bus.$emit('dynamic-list:sync', $event)"
        @cancel="closeDialog"
      />
    </modal>
  </page>
</template>

<script>
import dialog from '~/mixins/dialog'
import filter from '~/mixins/filter'
import form from './components/form.vue'
export default {
  name: 'UserIndex',

  layout: 'dashboard',

  mixins: [dialog, filter],

  components: {
    UserForm: form,
  },

  data: () => ({
    api: {
      endpoint: '/api/users?with[company]=id,name,bi_url',
      filter: {
        with: 'all',
      },
    },

    orderList: [
      { text: 'ID', value: 'id' },
      { text: 'Criado Em', value: 'created_at' },
      { text: 'Atualizado Em', value: 'updated_at' },
    ],

    pageName: 'admin-users-id',

    item: {},

    filter: {
      column: {
        company: null,
      },

      collection: false,

      data: {},
    },

    mapItem: {
      id: 'id',
      company_id: 'company.id',
      name: 'name',
      email: 'email',
      password: '',
      password_confirmation: '',
      has_report: 'has_report',
      created_at: 'created_at',
      updated_at: 'updated_at',
    },
  }),
}
</script>

<style lang="scss" scoped></style>
