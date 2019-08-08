// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import 'babel-polyfill'
import router from './router'
import store from './store'


import md5 from 'js-md5'
Vue.prototype.$md5 = md5

import api from '@/axios/api' // 导入api接口
Vue.prototype.$api = api // 将api挂载到vue的原型上

import './styles/reset.css'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = false

Vue.use(ElementUI)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
