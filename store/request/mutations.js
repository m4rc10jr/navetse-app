export default {
  set_response(state, response) {
    const { data = {}, status = 200, statusText = 'OK' } = response;

    state.data = {
      ...data,
      status,
      statusText
    };
  },

  set_loading(state, loading) {
    state.loading = loading;
    state.time = new Date();
  },

  reset(state) {
    state.data = {
      status: null,
      statusText: null,
      message: null,
      errors: [],
      data: {}
    };
  }
}
