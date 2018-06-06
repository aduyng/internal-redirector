import Vue from 'vue';
import Vuetify from 'vuetify';
import Layout from './components/Layout/Layout.vue';

Vue.use(Vuetify);

new Vue({
  el: '#layout',
  render: h => h(Layout)
})