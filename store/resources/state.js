export default () => ({
  item: {
    rows: [],
    ttl: false,
    seconds: 0
  },

  department: {
    rows: [],
    ttl: false,
    seconds: 0
  },

  employee: {
    rows: [],
    ttl: false,
    seconds: 0
  },

  client: {
    rows: [],
    ttl: false,
    seconds: 0
  },

  state: {
    rows: [],
    ttl: true,
    seconds: 60 * 60 * 24
  },

  city: {
    rows: [],
    ttl: false,
    seconds: 0
  },

  account: {
    rows: [],
    ttl: true,
    seconds: (60 * 60)
  }
})
