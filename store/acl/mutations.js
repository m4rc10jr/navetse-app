import moment from "moment";

export default {
  set(state, data) {
    state.data = data;
    state.loaded = true;
    state.expires_in = moment().add('1', 'hour');
  },

  flush(state) {
    state.data = [];
    state.loaded = false;
    state.expires_in = null;
  }
}
