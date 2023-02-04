export default async function ({ store, redirect, $axios }) {
  store.commit('layout/resetNotification');

  if (!store.state.loaded && !store.getters['account/guest']) {
    return redirect('/login')
  }

  const { access_token } = store.state.account.credentials;

  // Informando token de acesso.
  $axios.setToken(access_token, 'Bearer');

  if (!store.state.account.loaded || store.getters['account/isFlush']) {
    console.info("-= sincronizando informações do usuário =-");
    // Carregar dados da conta
    await store.dispatch('account/fetch');
  }

  await store.dispatch('resources/fetch', { resource: 'state' })
}
