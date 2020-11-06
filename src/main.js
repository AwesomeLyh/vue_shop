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

axios.defaults.baseURL = "http://localhost:8888/api/private/v1/";

axios.interceptors.request.use(config => {
  console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem("token");
  return config;
});

//给Vue的原型对象添加一个属性
Vue.prototype.$http = axios;

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
