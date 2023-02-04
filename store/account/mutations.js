import moment from "moment";

export default {
  auth(state, data) {
    state.credentials = {
      ...data,
    };
  },

  set(state, payload) {
    state.data = payload;
    state.loaded = true;
    state.expires_in = moment().add('1', 'hour');
  },

  dashboard(state, payload) {
    state.dashboard = payload;
  },

  update(state, data) {
    state.data = {
      ...state.data,
      ...data
    }

    state.loaded = true;
  },

  updateCompany(state, data) {
    state.companySelected = {...data}
    state.loaded = true
  },

  flush(state) {
    state.data = {}
    state.dashboard = {}
    state.credentials = {}
    state.loaded = false
    state.expires_in = null
  }
}
