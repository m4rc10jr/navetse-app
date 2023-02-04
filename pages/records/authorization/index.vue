<template>
  <page>
    <breadcrumb
      slot="header"
      title="Autorização de Acesso"
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
      <template v-slot:item="{ item }">
        <v-list-item-title>
          <span>{{ item.admin.name }}</span>
          <b>gerou para</b>
          <span>{{ item.requester.name }}</span>
        </v-list-item-title>

        <v-list-item-subtitle class="mt-2">
          <chip color="error" :outlined="false" v-if="!item.is_valid"
            >Expirou</chip
          >
          <chip
            color="primary"
            :outlined="false"
            @click="copy(item)"
            :disabled="!item.is_valid"
          >
            <custom-icon size="11px">content_copy</custom-icon>
            <span class="ml-1">{{ item.token }}</span>
          </chip>

          <chip color="primary">
            <span v-if="item.usage_limit > 1">Usos</span>
            <span v-else>Uso</span>
            <span class="ml-1">{{ item.uses }} de {{ item.usage_limit }}</span>
          </chip>
        </v-list-item-subtitle>

        <v-list-item-subtitle> </v-list-item-subtitle>
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
  name: 'AuthorizationIndex',

  layout: 'dashboard',

  mixins: [dialog, filter],

  components: {
    DepartmentForm: () => import('./components/form.vue'),
  },

  data: () => ({
    api: {
      endpoint: '/api/access-permission',
      filter: {
        with: 'all',
      },
    },

    pageName: 'records-authorization-id',

    mapItem: {
      id: 'id',
      requester_id: 'requester.id',
      usage_limit: 'usage_limit,1',
      created_at: 'created_at',
      updated_at: 'updated_at',
    },
  }),

  methods: {
    /**
     *
     */
    copy(item) {
      navigator.clipboard.writeText(item.token)

      this.$notify.info('Token copiado!')
    },
  },
}
</script>

<style lang="scss" scoped></style>
