<template>
  <page>
    <breadcrumb
      slot="header"
      title="Metas"
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
        <v-list-item-title>{{ item.department.title }}</v-list-item-title>
        <v-list-item-subtitle class="mt-2">
          <chip color="primary" :outlined="false">{{
            item.competence_date | formatDate('MM/YYYY')
          }}</chip>
          <chip>{{ item.amount | brl }}</chip>
        </v-list-item-subtitle>
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
  name: 'GoalIndex',

  layout: 'dashboard',

  mixins: [dialog, filter],

  components: {
    DepartmentForm: () => import('./components/form.vue'),
  },

  data: () => ({
    api: {
      endpoint: '/api/goals',
      filter: {
        with: 'all',
      },
    },

    pageName: 'records-goal-id',

    item: {},
  }),
}
</script>

<style lang="scss" scoped></style>
