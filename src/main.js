import Vue from 'vue'
import router from '@/router/index'
import store from '@/store/index'

import moment from 'moment'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import '@/assets/css/global.css'

import App from '@/App'

moment.locale('zh-cn')

Vue.config.productionTip = false

Vue.use(ElementUI)

new Vue({
    router: router,
    store: store,
    'render': h => h(App)
}).$mount('#app')
