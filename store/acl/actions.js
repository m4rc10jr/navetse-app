export default {
  async fetch({ commit }) {
    try {
      // const { data } = await this.$services
      //   .api('optimusprime')
      //   .get('df2fb8db-1353-4ab0-ab69-b34e5e4d86f6')

      // commit('SET', data);
    } catch (e) {
      this.$notify.error(e.message || 'falhou ao consulta papéis.')
    }
  },
}
