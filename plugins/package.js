import Vue from 'vue'
import Vuelidate from 'vuelidate';
import VueTheMask from 'vue-the-mask'
import VuetifyMoney from "vuetify-money";

export default ({ }) => {
  Vue.use(Vuelidate);
  Vue.use(VueTheMask);
  Vue.use(VuetifyMoney);
}
