<template>
  <page>
    <breadcrumb
      slot="header"
      title="Grupos"
      has-filter
      @filter:sync="syncFilter"
      @filter:close="cancelFilter"
      @search="$bus.$emit('dynamic-list:fetch', $event)"
      :options="filter"
      :search-options="{
        placeholder: 'ID, Grupo',
      }"
    ></breadcrumb>

    <dynamic-list v-model="api" @edit="openDialog" icon="scale">
      <template v-slot:item="{ item }">
        <v-list-item-title>{{ item.title }}</v-list-item-title>
        <v-divider class="my-1" dark></v-divider>
        <!-- <v-list-item-subtitle>
          <chip>{{ item.symbol }}</chip>
        </v-list-item-subtitle> -->
      </template>
    </dynamic-list>

    <button-add @click="openDialog" />

    <modal @close="closeDialog" v-model="dialog" :is-new="!item.id">
      <group-form
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
  name: 'GroupIndex',

  layout: 'dashboard',

  mixins: [dialog, filter],

  components: {
    groupForm: () => import('./components/GroupForm'),
  },

  data: () => ({
    api: {
      endpoint: '/api/groups',
      filter: {
        with: 'all',
      },
    },

    item: {},

    filter: {
      column: {},
      collection: false,
      data: {},
    },
  }),
}
</script>

<style lang="scss" scoped></style>
