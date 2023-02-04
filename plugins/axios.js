export default function ({ $axios, store, route }) {
  $axios.onRequest(config => {
    // console.info('solicitando recursos em >> [%s] %s', config.method, config.url)
    store.commit('request/reset');
    store.commit('request/set_loading', true);
  })

  $axios.onResponse(response => {
    store.commit('request/set_loading', false);
    return response;
  });

  $axios.onError(e => {
    store.commit('request/set_loading', false);
    store.commit('request/set_response', e.response)

    if (e.response.status === 401 && route.name !== "login") {
      store.dispatch('account/logout');
    }
  });
}
