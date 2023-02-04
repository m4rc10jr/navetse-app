<template>
  <page>
    <breadcrumb
      slot="header"
      title="Envolvidos"
      has-filter
      @filter:sync="syncFilter"
      @filter:close="cancelFilter"
      @search="$bus.$emit('dynamic-list:fetch', $event)"
      :options="filter"
      :search-options="{
        placeholder: 'ID, Nome, Telefone ou Documento',
      }"
    >
      <template v-slot:filters>
        <v-col cols md="3">
          <select-default
            label="Tipo"
            :items="filter.data.types"
            v-model="filter.column.type"
          />
        </v-col>

        <v-col cols md="3">
          <select-default
            label="Tipo Pessoa"
            :items="filter.data.persons"
            v-model="filter.column.person"
          />
        </v-col>
      </template>
    </breadcrumb>

    <dynamic-list v-model="api" @edit="openDialog" icon="person">
      <template v-slot:item="{ item }">
        <v-list-item-title>{{ item.name }}</v-list-item-title>
        <v-divider class="my-1" dark></v-divider>
        <v-list-item-subtitle>
          <v-layout>
            <chip label small>
              {{ item.type.title | capitalize }}
            </chip>
            <v-divider class="px-1" vertical dark></v-divider>
            <chip label small>
              {{ item.type_person_label | capitalize }}
            </chip>
          </v-layout>
        </v-list-item-subtitle>
      </template>

      <template v-slot:item.action="{ item }">
        <button-delete
          :endpoint="api.endpoint"
          :id="item.id"
          table
          @completed="$bus.$emit('dynamic-list:remove', $event)"
        />
        <div class="d-flex flex-column align-end">
          <div class="d-flex">
            <custom-icon>update</custom-icon>
            <small class="ml-2">{{ item.updated_at }}</small>
          </div>
          <small class="mt-1">{{ item.created_at }}</small>
        </div>
      </template>
    </dynamic-list>

    <button-add @click="openDialog" />

    <modal @close="closeDialog" v-model="dialog" :is-new="!item.id">
      <user-form
        :data="item"
        @saved="$bus.$emit('dynamic-list:sync', $event)"
        @cancel="closeDialog"
        v-if="dialog"
      />
    </modal>
  </page>
</template>

<script>
import dialog from '~/mixins/dialog'
import filter from '~/mixins/filter'
import form from './components/form.vue'
export default {
  name: 'EntityIndex',

  layout: 'dashboard',

  mixins: [dialog, filter],

  components: {
    UserForm: form,
  },

  data: () => ({
    api: {
      endpoint: '/api/entities',
      filter: {
        with: 'all',
      },
    },

    filter: {
      column: {
        person: null,
        type: null,
      },

      collection: false,

      data: {
        types: [
          { text: 'Cliente', value: 1 },
          { text: 'Fornecedor', value: 2 },
          { text: 'Todos', value: null },
        ],

        persons: [
          { text: 'Pessoa Física', value: 'physical' },
          { text: 'Pessoa Jurídica', value: 'legal' },
          { text: 'Todos', value: null },
        ],
      },
    },

    pageName: 'records-entity-id',

    item: {},
  }),

  computed: {
    isNew() {
      return !this.item?.id
    },
  },

  fetch() {
    Promise.all([
      this.$store.dispatch('resources/fetch', {
        resource: 'city',
      }),

      this.$store.dispatch('resources/fetch', {
        resource: 'state',
      }),
    ])
  },
}
</script>

<style lang="scss" scoped></style>
