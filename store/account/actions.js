export default {
  /**
   * @param {*} context
   */
  async fetch({ commit }) {
    const data = await this.$axios.$get('/api/user')

    commit('set', data);
  },

  /**
   * Atualizar dados da conta.
   *
   * @param {*} context
   */
  async save({ commit }, payload) {
    const data = await this.$axios.$put('api/user', payload);

    commit('update', data)

    this.$notify.success('Sua conta foi atualizada!', {
      onComplete: () => this.$router.push('/')
    })
  },

  /**
   * Autenticar
   *
   * @param {*} param
   * @param {*} credentials
   */
  async login({ commit, dispatch}, credentials) {
    const data = await this.$axios.$post('login', credentials);
    const { user, ...token } = data;

    commit('auth', token);
    commit('set', user);

    this.$axios.setToken(data.access_token, 'Bearer');

    if(user.company_used) {
      await dispatch('findCompanyInUser');
    }

    this.$router.push('/');
  },

  /**
   * Auterar conta.
   *
   * @param {*} param
   * @param {*} credentials
   */
  async swich({ commit, dispatch }, company_id) {
    const data = await this.$axios.$post('/api/user/swich', {company_id});
    const { user, ...token } = data;

    commit('auth', token);
    commit('set', user)

    this.$axios.setToken(data.access_token, 'Bearer');
    await dispatch('findCompanyInUser')
  },

  /**
   * @param {*} param
   */
  async logout({ commit }) {
    try {
      await this.$axios.$post('/api/user/logout');
    }catch(e) {}

    commit('flush');
    commit('request/reset', {}, { root: true });
    commit('resources/flush', {}, { root: true });

    window.localStorage.removeItem('navetse_store')

    this.$router.push('/login');
  },

  /**
   * Carregar relatorio.
   *
   * @param {*} param0
   */
  async dashboard({ commit }) {
    const data = await this.$axios.$get('/api/reports');

    commit('dashboard', data)
  },

  /**
   * Carregar relatorio.
   *
   * @param {*} param0
   */
  async findCompanyInUser({ commit }) {
    const data = await this.$axios.$get('/api/user/company');
    commit('updateCompany', data)
  }
}
