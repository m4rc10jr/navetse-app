
import baseState from './state'

export default {
  set(state, data) {
    state.data = {...state.data, ...data};

    for(let [k, v] of Object.entries(data)) {
      state.data[k] = v
    }
  },

  filterSync(state, data) {
    state.filter = {...state.filter, ...data}
  },

  filterReset(state) {
    state.filter = {}
  },

  flush(state) {
    Object.assign(state, {...baseState()})
  }
}
