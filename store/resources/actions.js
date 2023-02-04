import Config from './_config'

export default {
  /**
   * Carregar dados da api.
   *
   * @param {*} param0
   * @param {*} payload
   */
  async fetch({ commit, getters, state }, payload = {}) {
    const { resource, options = {} } = payload

    const config = Config[resource]
    const force = payload?.force ?? false;

    if (!config) {
      throw new Error(`Resource ${resource} not found`)
    }

    if (!getters.expired(resource) && getters[config.key].length > 0 && !force) {
      return getters[config.key]
    }

    const items = await this.$axios.$get(config.endpoint, {
      params: {
        ...config.options,
        ...options,
      },
    })

    if (!payload?.noCache) {
      commit('set', { resource, items, config })
    }

    return items
  },
}
