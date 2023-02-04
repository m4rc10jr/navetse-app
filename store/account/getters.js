import { get } from "lodash";
import moment from "moment";

export default {
  data: state => state.data,

  dashboard: state => state?.dashboard ?? {},

  companyInUse: state => state.companySelected,

  company: state => {
    const { company, company_used, companies = [] } = state.data
    if(!company_used || company.id === company_used) return company;
    return companies.find(h => h.id == company_used)
  },

  get: state => (key, _default) => get(state.data, key, _default),

  roles: state => state.data.roles ?? [],

  permissions: state => state.data.permissions ?? [],

  credentials: state => state.credentials,

  guest: state => !!state.credentials.access_token,

  isLoaded: state => state.loaded,

  isFlush: state => state.expires_in ? moment().isAfter(state.expires_in) : true,

  isRoot: state => state.data.root,

  isAdmin: state => state.data.is_admin,

  isReport: (state, getters) => getters.isRoot || getters.isAdmin || getters.get('has_report'),

  authorize: (state, getters) => (value = '*') => {
    const { permissions = [], roles = [] } = getters;

    const _roles = [
      ...roles,
      getters.isRoot ? 'root' : 'company',
      getters.isAdmin ? 'company-admin' : ''
    ].filter(h => h);

    if (value === '*') return true;

    const authorize = (ability) => (ability === 'root' && getters.isRoot) || _roles.includes(ability) || permissions.includes(ability);

    const abilities = value.split(',');

    return abilities.some(ability => authorize(ability));
  }
}
