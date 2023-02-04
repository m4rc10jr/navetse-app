<template>
  <page>
    <breadcrumb
      slot="header"
      title="Departamentos"
      has-filter
      @filter:sync="syncFilter"
      @filter:close="cancelFilter"
      @search="$bus.$emit('dynamic-list:fetch', $event)"
      :options="filter"
      :search-options="{
        placeholder: 'ID ou Nome',
      }"
    ></breadcrumb>

    <dynamic-list v-model="api" @edit="openDialog">
      <template v-slot:item.icon>
        <custom-icon>workspaces</custom-icon>
      </template>

      <template v-slot:item="{ item }">
        <v-list-item-title>
          {{ item.title }}
        </v-list-item-title>
      </template>
    </dynamic-list>

    <button-add @click="openDialog" />

    <modal @close="closeDialog" v-model="dialog" :row="!item.id" v-if="dialog">
      <department-form
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

export default {
  name: 'DepartmentIndex',

  layout: 'dashboard',

  mixins: [dialog, filter],

  components: {
    DepartmentForm: () => import('./components/form.vue'),
  },

  data: () => ({
    api: {
      endpoint: '/api/departments',
      filter: {
        with: 'all',
      },
    },

    pageName: 'records-team-id',

    item: {},
  }),
}
</script>

<style lang="scss" scoped></style>
