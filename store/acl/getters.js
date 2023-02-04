import moment from "moment";

export default {
  items: state => state.data || [],

  getRoleName: state => (slug) => state.data.find(item => item.slug === slug).name || "",

  getRoleColor: state => (slug) => state.data.find(item => item.slug === slug).color || "#ddd",

  isLoaded: state => state.loaded,

  isFlush: state => state.expires_in ? moment().isAfter(state.expires_in) : true,
}
