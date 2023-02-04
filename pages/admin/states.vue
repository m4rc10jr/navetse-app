<template>
  <page>
    <breadcrumb
      slot="header"
      title="Estados"
      has-filter
      @filter:sync="syncFilter"
      @filter:close="cancelFilter"
      @search="$bus.$emit('dynamic-list:fetch', $event)"
      :options="filter"
      :search-options="{
        placeholder: 'ID, Estado ou Região',
      }"
    ></breadcrumb>

    <dynamic-list v-model="api" @edit="openDialog" icon="settings">
      <template v-slot:item="{ item }">
        <v-list-item-title
          >{{ item.name }}/{{ item.abbreviation }}</v-list-item-title
        >
        <v-divider class="my-1" dark></v-divider>
        <v-list-item-subtitle>
          <chip>{{ item.region }}</chip>
        </v-list-item-subtitle>
      </template>
    </dynamic-list>

    <button-add @click="openDialog" />

    <modal @close="closeDialog" v-model="dialog" :is-new="!item.id">
      <city-form
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
  name: 'StateIndex',

  layout: 'dashboard',

  mixins: [dialog, filter],

  components: {
    cityForm: () => import('./components/StateForm'),
  },

  data: () => ({
    api: {
      endpoint: '/api/states',
      filter: {
        with: 'all',
      },
    },

    item: {},

    filter: {
      collection: false,
      column: {},
      data: {},
    },
  }),
}
</script>

<style lang="scss" scoped></style>
