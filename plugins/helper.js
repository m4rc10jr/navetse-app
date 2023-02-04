import Vue from "vue";
import notify from "../common/scripts/notify";
import ordered from '../common/scripts/ordered'

export default ({ store, $authorize }, inject) => {
  const authorizeMapItems = (items, column = 'acl') => items.filter(item => !item[column] || $authorize(item[column]))

  inject('notify', notify(store))
  inject('ordered', ordered)
  inject('authorizeMapItems', authorizeMapItems)
  inject('bus', new Vue())
}
