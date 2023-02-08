export default {
  item: {
    endpoint: '/api/items',
    ttl: -1,
    options: {
      select: 'id,unit_id,title,cost,suggested_price',
      'includes[unit]': 'id,symbol,title',
      limit: 100,
      'scope[withTrashed]': true
    },
    key: 'items'
  },

  department: {
    endpoint: '/api/departments',
    ttl: 60 * 60,
    options: {
      select: 'id,title',
    },
    key: 'departments'
  },

  city: {
    endpoint: '/api/cities',
    ttl: -1,
    options: {
      select: 'id,name,state_id',
      'includes[state]': 'id'
    },
    key: 'cities'
  },

  state: {
    endpoint: '/api/states',
    ttl: 60 * 60,
    options: {
      select: 'id,name,abbreviation'
    },
    key: 'states'
  },

  employee: {
    endpoint: '/api/employees',
    ttl: -1,
    options: {},
    key: 'employees'
  },

  account: {
    endpoint: '/api/accounts',
    ttl: 60 * 60,
    options: {
      select: 'id,title,type'
    },
    key: 'accounts'
  }
}
