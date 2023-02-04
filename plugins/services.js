export default function ({ $axios, env, store, redirect, route }, inject) {
  inject('authorize', store.getters['account/authorize']);
}
