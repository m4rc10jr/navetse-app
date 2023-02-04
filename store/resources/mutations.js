import moment from 'moment';
import Config from './_config';

export default {

  set(state, payload = { resource: '', items: [], config: {}}) {
    const { resource, items: rows, config } = payload;
    const { ttl } = config;

    Object.assign(state[resource], {
      rows,
      ttl: ttl !== -1 ? moment().add(ttl, 'seconds') : false,
    })
  },

  flush(state) {
    for (const [name, collection] of Object.entries(state)) {
      const config = Config[name];

      if (!config) {
        delete state[name];
        continue;
      }

      collection.rows = []
      collection.ttl = config.ttl;
    }
  }
}
