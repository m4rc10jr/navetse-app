import { cloneDeep, get } from "lodash"

export default {
  data: () => ({
    dialog: false,
    mapItem: []
  }),

  methods: {
    /**
     * Cancela modal de edição.
     *
     * @returns {void}
     */
    closeDialog() {
      this.dialog = false
      this.item = {}
    },

    /**
     * Abrir modal de edição.
     *
     * @param {*} item
     * @returns {void}
     */
    openDialog(item = {}, edit = false) {
      let mutable = cloneDeep(item)
      let data = {};
      let map = Object.entries(this.mapItem);

      if (typeof this.beforeOpenDialog === "function") {
        mutable = { ...this.beforeOpenDialog(mutable) };
      }

      if(map.length > 0) {
        for(const [k, v] of map) {

          if(v.includes(',')) {
            const [_key, _default] = v.split(',')

            data[k] = get(mutable, _key, _default)
            continue;
          }

          data[k] = get(mutable, v ?? k, '')
        }
      }else {
        data = {...mutable}
      }

      Object.assign(data, { edit })

      this.item = data
      this.dialog = true
    },
  }
}
