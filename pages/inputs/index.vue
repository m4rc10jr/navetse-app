<template>
  <page>
    <breadcrumb
      slot="header"
      title="Lançamentos"
      has-filter
      @filter:sync="syncFilter"
      @filter:close="cancelFilter"
      @search="$bus.$emit('dynamic-list:fetch', $event)"
      :options="filter"
      :search-options="{
        placeholder: 'Descrição e Valor total',
      }"
    >
      <template slot="filters">
        <v-col md="2">
          <input-text
            label="ID"
            type="tel"
            hide-details
            outlined
            v-model="filter.column.id"
          />
        </v-col>

        <v-col md="3">
          <select-dynamic
            label="Conta"
            no-api-data
            :data="filter.data.accounts"
            v-model="filter.column.account_id"
            item-text="title"
          />
        </v-col>

        <v-col md="3">
          <select-dynamic
            label="Sub Conta"
            no-api-data
            :data="subAccounts"
            item-text="title"
            v-model="filter.column.sub_account_id"
            :disabled="!filter.column.account_id"
          />
        </v-col>

        <v-col md="2">
          <select-default
            label="Status"
            v-model="filter.column.status"
            :items="filter.data.status"
          />
        </v-col>

        <v-col md="2">
          <select-default
            v-model="filter.column.competence_date"
            :items="months"
            label="Mês Competência"
            :options="{
              itemText: 'text',
              itemValue: 'value',
              valueComparator: (a, b) => {
                const pattern = /\d{4}-\d{2}/

                return b ? a.match(pattern)[0] === b.match(pattern)[0] : false
              },
            }"
          />
        </v-col>
      </template>
    </breadcrumb>

    <dynamic-list v-model="api" @edit="open">
      <template v-slot:item.icon="{ item }">
        <custom-icon>{{
          item.account.type === 'input' ? 'arrow_upward' : 'arrow_downward'
        }}</custom-icon>
      </template>

      <template v-slot:item="{ item }">
        <v-list-item-title>
          <span>{{ item.account.title }}</span>
        </v-list-item-title>
        <v-divider class="my-1" dark></v-divider>

        <v-list-item-subtitle class="mt-1">
          <chip color="primary">
            {{ item.competence_date | formatDate('MMMM/YYYY') }}
          </chip>

          <chip
            v-for="(detail, index) in item.details"
            :key="`detail-${index}`"
            :class="{ 'ml-1': index > 0 }"
          >
            {{ detail.title }}
          </chip>

          <!-- <chip
            :outlined="false"
            v-for="(resume, index) in item.resumePayments"
            :key="`resume-payment-${index}`"
            :class="{
              'ml-1': index > 0,
              'white--text': resume.status === 'Andamento',
            }"
            :color="
              resume.status !== 'Andamento' ? 'primary' : 'grey lighten-1'
            "
          >
            Parcela {{ index + 1 }}º ({{ resume.type }})
          </chip> -->
        </v-list-item-subtitle>
      </template>

      <template v-slot:item.action="{ item }">
        <div class="d-flex flex-column align-end">
          <v-chip
            small
            :color="item.status === 'Em Aberto' ? 'grey' : 'primary darken-2'"
            dark
          >
            {{ item.status | capitalize }}
          </v-chip>

          <small class="my-1">{{ item.date | formatDate('DD/MM/YYYY') }}</small>
          <small>
            <b>{{ item.total_value | brl }}</b>
          </small>
        </div>
      </template>
    </dynamic-list>

    <button-add @click="open" />
  </page>
</template>

<script>
import filter from '~/mixins/filter'

export default {
  name: 'InputIndex',

  layout: 'dashboard',

  mixins: [filter],

  data: () => ({
    api: {
      endpoint: '/api/inputs',
      filter: {},
      with: 'all',
    },

    filter: {
      column: {
        id: null,
        account_id: null,
        sub_account_id: null,
        status: null,
        competence_date: null,
      },

      data: {
        accounts: [],
        sub_accounts: [],
        status: [],
      },

      collection: 'inputs',
    },
  }),

  computed: {
    subAccounts() {
      return (
        this.filter.data.sub_accounts?.filter(
          (h) => h.account_id === this.filter.column.account_id
        ) ?? []
      )
    },

    months() {
      return this.$helper.monthGenerator()
    },
  },

  methods: {
    /**
     * Abrir editor.
     *
     * @param {*} event
     */
    open(event) {
      this.$router.push({
        name: 'inputs-id',
        params: { id: event?.id ?? 'create' },
      })
    },
  },
}
</script>

<style lang="scss" scoped></style>
