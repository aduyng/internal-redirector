import Vue from 'vue';
import Layout from './components/Layout/Layout.vue';
import './style/options.scss';

new Vue({
  el: '#layout',
  render: h => h(Layout)
})