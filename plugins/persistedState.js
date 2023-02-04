import createPersistedState from 'vuex-persistedstate'

export default ({ store }) => {
  createPersistedState({
    key: 'navetse_store',
    storage: window.sessionStorage,
    paths: ['account', 'layout', 'context', 'resources']
  })(store)
}
