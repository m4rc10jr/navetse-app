<template>
  <page>
    <breadcrumb slot="header" title="Homepage" />

    <template v-slot:row v-if="loaded">
      <card-widget label="Entradas" :rows="inputs" />

      <card-widget label="Saidas" :rows="outputs" />

      <card-widget label="Usuarios" :rows="users" />

      <card-widget label="Envolvidos" :rows="entities" />

      <card-widget label="Orçamentos" :rows="budgets" />

      <card-widget label="Agendamentos" :rows="schedules" />
    </template>
  </page>
</template>

<script>
import { mapGetters } from 'vuex'
import CardWidget from '../components/Card/Widget.vue'
export default {
  components: { CardWidget },
  layout: 'dashboard',

  name: 'Home',

  data: () => ({
    loaded: false,
  }),

  computed: {
    inputs() {
      return this.dashboard['Entradas']
    },

    outputs() {
      return this.dashboard['Saídas']
    },

    budgets() {
      return this.dashboard['Orçamentos']
    },

    users() {
      return this.dashboard['Usuários']
    },

    schedules() {
      return this.dashboard['Agendamentos']
    },

    entities() {
      return this.dashboard['Clientes']
    },

    ...mapGetters('account', ['dashboard']),
  },

  async fetch() {
    this.loaded = false
    await this.$store.dispatch('account/dashboard')
    this.loaded = true
  },
}
</script>

<style></style>
