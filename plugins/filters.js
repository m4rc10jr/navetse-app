import Vue from 'vue'
import moment from 'moment'
import { capitalize, has } from 'lodash'
import * as common from '../common'

export default ({ }, inject) => {
  moment.locale('pt-br')

  Vue.filter('formatDate', common.formatDate)
  Vue.filter('mask', common.mask)
  Vue.filter('capitalize', capitalize);

  Vue.filter('cpf', (value) => common.mask(value, '###.###.###-##'))
  Vue.filter('cnpj', (value) => common.mask(value, '##.###.###/####-##'))

  Vue.filter('currency', (value, currency = 'brl') => common.currencies[currency](value))
  Vue.filter('brl', (value) => common.currencies.brl(value))
  Vue.filter('usd', (value) => common.currencies.usd(value))

  inject('helper', {
    currency: common.currencies,
    moment,
    has,
    ...common,
  })
}
