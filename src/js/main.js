// Main JS File
import '../style/style.scss'
import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import router from './router'
import store from './store'
import '@babel/polyfill'
import 'svgxuse' // eslint-disable-line
import './partial/kittnad' // Small Advertising for Kittn :)
import './partial/modernizer-loader'
import './partial/detect-browser'
import './partial/disable-pointerevents'

// keep vue-router and vuex store in sync
sync(store, router)

import('./app')
  .then((App) => {
    /* eslint-disable no-new */
    new Vue({
      el: '#app',
      router,
      store,
      render: (h) => h(App.default)
    })
  })
