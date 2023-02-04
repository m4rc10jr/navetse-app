<template>
  <page>
    <breadcrumb
      slot="header"
      title="Empresas"
      has-filter
      @filter:sync="api.filter = $event"
      :options="{ orderList }"
    ></breadcrumb>

    <dynamic-list v-model="api" @edit="openDialog">
      <template v-slot:item.icon>
        <custom-icon>apartment</custom-icon>
      </template>
      <template v-slot:item="{ item }">
        <v-list-item-title>{{ item.name }}</v-list-item-title>
        <v-divider class="my-1" dark></v-divider>
        <v-list-item-subtitle>
          <chip>{{ item.report.users }} usuário(s)</chip>

          <chip v-if="item.is_main" color="primary" :outlined="false"
            >Matriz</chip
          >

          <chip v-if="item.is_branch" color="primary" :outlined="false"
            >Filial</chip
          >

          <chip
            v-for="(company, index) in item.companies"
            :key="index"
            color="primary"
          >
            <custom-icon size="11px">account_tree</custom-icon>
            <span class="ml-1">{{ company.name }}</span>
          </chip>
        </v-list-item-subtitle>
      </template>
    </dynamic-list>

    <button-add @click="openDialog" />

    <modal @close="closeDialog" v-model="dialog" :is-new="!item.id">
      <company-form
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

export default {
  name: 'CompanyIndex',

  layout: 'dashboard',

  mixins: [dialog],

  components: {
    companyForm: () => import('./components/CompanyForm'),
  },

  data: () => ({
    api: {
      endpoint: '/api/companies',
      filter: {
        with: 'all',
      },
    },

    orderList: [
      { text: 'ID', value: 'id' },
      { text: 'Criado Em', value: 'created_at' },
      { text: 'Atualizado Em', value: 'updated_at' },
    ],

    item: {},
  }),
}
</script>

<style lang="scss" scoped></style>
