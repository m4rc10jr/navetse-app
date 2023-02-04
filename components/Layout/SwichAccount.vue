<template>
  <!-- row justify-end class="ma-2" -->
  <v-layout>
    <v-flex xs12>
      <v-select
        prepend-inner-icon="mdi-swap-horizontal"
        label="Alterar Empresa"
        :items="companies"
        dense
        hide-details
        outlined
        :value="user.company_used"
        @change="login"
      ></v-select>
    </v-flex>

    <v-dialog
      fullscreen
      overlay-color="primary"
      v-model="dialog"
      content-class="swich-account"
    >
      <v-card flat color="primary">
        <v-layout row justify-center align-center style="height: 100vh">
          <v-flex xs12 white--text text-center align-self-center>
            <v-fade-transition mode="out-in">
              <h1 class="heading" :key="currentText">{{ currentText }}</h1>
            </v-fade-transition>
          </v-flex>
        </v-layout>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data: () => ({
    dialog: false,

    pipeline: [
      'Acessando Empresa...',
      'Carregando Dados...',
      'Sincronizando...',
      'Tudo Pronto!',
    ],
    currentText: '',
  }),

  computed: {
    companies() {
      let companies = []

      const { name, id } = this.user.company

      companies.push({ text: name, value: id })

      for (let company of this.user.companies) {
        companies.push({ text: company.name, value: company.id })
      }

      return companies
    },

    ...mapGetters('account', {
      user: 'data',
    }),
  },

  watch: {
    async dialog(value) {
      if (!value) {
        return this.$router.push('/')
      }

      const delay = (duration = 1000) =>
        new Promise((resolve) => {
          setTimeout(() => resolve(true), duration)
        })

      for (const pipeline of this.pipeline) {
        this.currentText = pipeline

        await delay(1000)
      }

      this.dialog = false
    },
  },

  methods: {
    /**
     * @param {*} company_id
     */
    async login(company_id) {
      try {
        this.dialog = true
        await this.$store.dispatch('account/swich', company_id)
        await this.update()
      } catch (e) {
        alert(e?.message)
      }
    },

    async update() {
      const pipelines = []
      pipelines.push(this.$store.dispatch('account/dashboard'))
      await Promise.all(pipelines)
    },
  },
}
</script>

<style lang="scss">
div.v-dialog__content:has(.swich-account) {
  z-index: 10003 !important;
}
</style>
