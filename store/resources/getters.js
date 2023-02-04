import moment from "moment";

export default {
  items: state => state.item.rows,

  departments: state => state.department.rows,

  employees: state => state.employee.rows,

  clients: state => state.client.rows,

  states: state => state.state.rows,

  cities: state => state.city.rows,

  accounts: state => state.account.rows,

  expired: (state) => (resource) => {
    const model = state[resource];
    if (!model.ttl || model.ttl === -1) return false;

    const date = moment(model.ttl)

    return date.isBefore(Date.now())
  }
}
