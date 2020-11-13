import Vue from "vue";
import Router from "vue-router";
import Login from "../components/Login.vue";
import Home from "../components/Home.vue";
import Welcome from "../components/Welcome.vue";
import Users from "../components/user/Users.vue";
import Roles from "../components/power/Roles.vue";
import CateGories from "../components/goods/CateGories.vue";
import Params from "../components/goods/Params.vue";
import Goods from "../components/goods/GoodsList.vue";
import AddGood from "../components/goods/Add.vue";

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: "/",
      redirect: "/login"
    },
    { path: "/login", component: Login },
    {
      path: "/home",
      component: Home,
      redirect: "/welcome",
      children: [
        { path: "/welcome", component: Welcome },
        { path: "/users", component: Users },
        { path: "/roles", component: Roles },
        { path: "/categories", component: CateGories },
        { path: "/params", component: Params },
        { path: "/goods", component: Goods },
        { path: "/goods/add", component: AddGood }
      ]
    }
  ]
});

//挂载路由守卫
router.beforeEach((to, from, next) => {
  if (to.path === "/login") return next();
  const tokenStr = window.sessionStorage.getItem("token");
  if (!tokenStr) return next("/login");
  next();
});

export default router;
