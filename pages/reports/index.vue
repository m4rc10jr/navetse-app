<template>
  <div>
    <iframe
      title="NAVETSE - FS Consultoria"
      :src="account('company.bi_url')"
      frameborder="0"
      allowFullScreen="true"
      v-if="account('company.bi_url')"
    ></iframe>

    <v-alert colored-border border="left" type="info" color="info" v-else>
      <b>Opss...</b>
      <span
        >O BI não foi configurado para sua empresa, informe a administração
        sobre o problema!</span
      >
    </v-alert>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ReportIndex',

  layout: 'dashboard',

  computed: {
    ...mapGetters({
      account: 'account/get',
      isAdmin: 'account/isAdmin',
    }),
  },

  middleware({ redirect, store }) {
    if (!store.getters['account/isReport']) {
      return redirect('/')
    }
  },
}
</script>

<style lang="scss" scoped>
iframe {
  width: 100%;
  height: 90vh;
}
</style>
