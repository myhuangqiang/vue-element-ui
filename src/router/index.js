import Vue from 'vue'
import Router from 'vue-router'


// 下面2行代码，没有指定webpackChunkName，每个组件打包成一个js文件。
const Login = () => import('@/pages/login')
const Main = () => import('@/pages/main')
const Home = () => import('@/pages/home')
const Auth = () => import('@/pages/system/auth')
const Role = () => import('@/pages/system/role')
const Menu = () => import('@/pages/system/role')
const Error404 = () => import('@/pages/errorPages/404')
// 下面2行代码，指定了相同的webpackChunkName，会合并打包成一个js文件。
// const ImportFuncDemo = () => import(/* webpackChunkName: 'ImportFuncDemo' */ '../components/ImportFuncDemo')
// const ImportFuncDemo2 = () => import(/* webpackChunkName: 'ImportFuncDemo' */ '../components/ImportFuncDemo2')


Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '*',
      component: Error404,
      meta: { title: '404' }
    },
    {
      path: '/',
      name: "main",
      component: Main,
      redirect: '/home',
      meta: { title: '首页',requireLogin: true },
      children: [
        {
          name: 'home',
          path: '/home',
          component: Home,
          meta: { requireLogin: true },
        },
      ]
    },
    {
      name: "systemManage",
      path: '/system',
      component: Main,
      redirect:'/system/auth',
      meta: { title: '系统管理' },
      children: [
        {
          name: "权限管理",
          path: '/system/auth',
          component: Auth,
          meta: { title: '权限管理' },
        },
        {
          name: "角色管理",
          path: '/system/role',
          component: Role,
          meta: { title: '角色管理' },
        },
        {
          name: "菜单管理",
          path: '/system/menu',
          component: Menu,
          meta: { title: '菜单管理' },
        },
        {
          name: "分组管理",
          path: '/system/group',
          component: Menu,
          meta: { title: '分组管理' },
        }
      ]
    },
    {
      name: "userManage",
      path: '/user',
      component: Main,
      redirect:'/user/integral',
      meta: { title: '用户管理' },
      children: [
        {
          name: "积分管理",
          path: '/user/integral',
          component: Menu,
          meta: { title: '积分管理' },
        },
      ]
    },
    {
      name: "accountManage",
      path: '/account',
      component: Main,
      redirect:'/account/email',
      meta: { title: '账号管理' },
      children: [
        {
          name: "邮箱管理",
          path: '/account/email',
          component: Menu,
          meta: { title: '邮箱管理' },
        },
        {
          name: "密码管理",
          path: '/account/pass',
          component: Menu,
          meta: { title: '密码管理' },
        }
      ]
    },
    {
      name: "contentManage",
      path: '/content',
      component: Main,
      redirect:'/content/classify',
      meta: { title: '内容管理' },
      children: [
        {
          name: "分类管理",
          path: '/content/classify',
          component: Menu,
          meta: { title: '分类管理' },
        },
        {
          name: "文章管理",
          path: '/content/article',
          component: Menu,
          meta: { title: '文章管理' },
        },
        {
          name: "评论管理",
          path: '/content/comment',
          component: Menu,
          meta: { title: '评论管理' },
        }
      ]
    },
  ]
})

router.beforeEach((to, from, next) => {
  if (to.meta.requireLogin){  // 判断该路由是否需要登录权限
    if (JSON.parse(localStorage.getItem('islogin'))) {  // 判断当前用户的登录信息islogin是否存在
      next()
    } else {
      next({
        path: '/login'
      })
    }
  } else {
    next()
  }
  /*如果本地 存在 token 则 不允许直接跳转到 登录页面*/
  // if(to.fullPath == "/login"){
  //   if(JSON.parse(localStorage.getItem('islogin'))){
  //     next({
  //       path: from.fullPath
  //     });
  //   }else {
  //     next()
  //   }
  // }
})


export default router