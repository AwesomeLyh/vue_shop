import Vue from "vue";
import App from "./App.vue";
import router from "./router";
//引入element注册的组件
import "./plugins/element.js";

//导入全局样式表
import "./assets/css/global.css";

//引入字体图标
import "./assets/fonts/iconfont.css";

//引入axios
import axios from "axios";

//引入树形表格插件
import TreeTable from "vue-table-with-tree-grid";

axios.defaults.baseURL = "http://localhost:8888/api/private/v1/";

//请求拦截器,给请求头带上Authorization
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem("token");
  return config;
});

//给Vue的原型对象添加一个属性
Vue.prototype.$http = axios;

//注册组件
Vue.component("tree-table", TreeTable);

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
