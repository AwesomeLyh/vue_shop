import Vue from 'vue'
import Router from 'vue-router'

// import Login from './components/Login.vue'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
// import Home from './components/Home.vue'
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
// import Welcome from './components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')

// import Users from './components/user/Users.vue'
const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/user/Users.vue')
// import Rights from './components/power/Rights.vue'
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Roles.vue')

// import Cate from './components/goods/Cate.vue'
const CateGories = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/CateGories.vue')
// import Params from './components/goods/Params.vue'
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Params.vue')

// import GoodsList from './components/goods/List.vue'
const Goods = () => import(/* webpackChunkName: "GoodsList_Add" */ '../components/goods/GoodsList.vue')
// import Add from './components/goods/Add.vue'
const AddGood = () => import(/* webpackChunkName: "GoodsList_Add" */ '../components/goods/Add.vue')

// import Order from './components/order/Order.vue'
const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/order/Order.vue')
// import Report from './components/report/Report.vue'
const Report = () => import(/* webpackChunkName: "Order_Report" */ '../components/report/Report.vue')

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/roles', component: Roles },
        { path: '/categories', component: CateGories },
        { path: '/params', component: Params },
        { path: '/goods', component: Goods },
        { path: '/goods/add', component: AddGood },
        { path: '/orders', component: Order },
        { path: '/reports', component: Report }
      ]
    }
  ]
})
Vue.use(Router)

// 挂载路由守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
