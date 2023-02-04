<template>
  <page>
    <breadcrumb
      slot="header"
      title="Cidades"
      has-filter
      @filter:sync="syncFilter"
      @filter:close="cancelFilter"
      @search="$bus.$emit('dynamic-list:fetch', $event)"
      :options="filter"
      :search-options="{
        placeholder: 'ID, Cidade ou Abreviação',
      }"
    >
      <template v-slot:filters>
        <v-layout>
          <v-col cols md="3">
            <select-default
              label="Estado"
              :items="states"
              v-model="filter.column.state"
              :options="{
                itemText: 'name',
                itemValue: 'id',
              }"
            />
          </v-col>
        </v-layout>
      </template>
    </breadcrumb>

    <dynamic-list v-model="api" @edit="openDialog" icon="settings">
      <template v-slot:item="{ item }">
        <v-list-item-title>{{ item.name }}</v-list-item-title>
        <v-divider class="my-1" dark></v-divider>
        <v-list-item-subtitle>
          <chip>{{ item.state.name }}</chip>
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
import { mapGetters } from 'vuex'
import dialog from '~/mixins/dialog'
import filter from '~/mixins/filter'

export default {
  name: 'CityIndex',

  layout: 'dashboard',

  mixins: [dialog, filter],

  components: {
    cityForm: () => import('./components/CityForm'),
  },

  data: () => ({
    api: {
      endpoint:
        '/api/cities?select=id,name,state_id,id_ibge,size,is_capital&includes[state]=id,name',
      filter: {
        with: 'all',
      },
    },

    item: {},

    filter: {
      collection: false,
      column: {
        state: null,
      },
      data: {},
    },
  }),

  computed: {
    ...mapGetters('resources', ['states']),
  },

  methods: {
    //
  },
}
</script>

<style lang="scss" scoped></style>
