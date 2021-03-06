import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 引入element注册的组件
import './plugins/element.js'

// 导入全局样式表
import './assets/css/global.css'

// 引入字体图标
import './assets/fonts/iconfont.css'

// 引入axios
import axios from 'axios'

// 引入树形表格插件
import TreeTable from 'vue-table-with-tree-grid'

// 引入进度条组件
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'

// 引入富文本编辑器组件
import VueQuillEditor from 'vue-quill-editor'

// 引入富文本编辑器的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 注册组件
Vue.component('tree-table', TreeTable)

// 注册组件
Vue.use(VueQuillEditor)

axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/'

// 请求拦截器,给请求头带上Authorization
axios.interceptors.request.use(config => {
  // 进度条启用
  Nprogress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

// 相应拦截器
axios.interceptors.response.use(config => {
  // 进度条结束
  Nprogress.done()
  return config
})

// 给Vue的原型对象添加一个属性
Vue.prototype.$http = axios

// 注册全局过滤器--转化时间格式
Vue.filter('dataFormat', function (data) {
  var dt = new Date(data * 1000)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
