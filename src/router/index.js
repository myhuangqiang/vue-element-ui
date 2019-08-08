import Vue from 'vue'
import Router from 'vue-router'


// 下面2行代码，没有指定webpackChunkName，每个组件打包成一个js文件。
const Login = () => import('@/pages/login')
const Main = () => import('@/pages/main')
const Home = () => import('@/pages/home')

// 自行测试模块
const Editor = () => import('@/pages/test/editor')
const TestPage = () => import('@/pages/test/testpage')
const FormRules = () => import('@/pages/test/formRules')

const Merchant = () => import('@/pages/promotion/merchant')
const Product = () => import('@/pages/promotion/product')
const Plan = () => import('@/pages/promotion/plan')
const KeyWord = () => import('@/pages/promotion/keyword')

const DayAgr = () => import('@/pages/dataManage/dayagr')
const Halfhouragr = () => import('@/pages/dataManage/halfhouragr')
const Merchantagr = () => import('@/pages/dataManage/merchantagr')

const User = () => import('@/pages/system/user')
const OfflineTask = () => import('@/pages/system/offlineTask')
const Preference = () => import('@/pages/system/preference')

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
    // 自行测试路由
    {
      name: "testManage",
      path: '/test',
      component: Main,
      redirect:'/test/editor',
      meta: { title: '测试模块' },
      children: [
        {
          name: "富文本",
          path: '/test/editor',
          component: Editor,
          meta: { title: '富文本' }
        },
        {
          name: "测试页面",
          path: '/test/testpage',
          component: TestPage,
          meta: { title: '测试页面' }
        },
        {
          name: "表单验证",
          path: '/test/formrules',
          component: FormRules,
          meta: { title: '表单验证' }
        }
      ]
    },

    {
      name: "promotion",
      path: '/promotion',
      component: Main,
      redirect:'/promotion/merchant',
      meta: { title: '推广管理' },
      children: [
        {
          name: "商户",
          path: '/promotion/merchant',
          component: Merchant,
          meta: { title: '商户' },
        },
        {
          name: "产品",
          path: '/promotion/product',
          component: Product,
          meta: { title: '产品' },
        },
        {
          name: "计划",
          path: '/promotion/plan',
          component: Plan,
          meta: { title: '计划' },
        },
        {
          name: "关键词",
          path: '/promotion/keyword',
          component: KeyWord,
          meta: { title: '关键词' }
        }
      ]
    },

    {
      name: "systemManage",
      path: '/system',
      component: Main,
      redirect:'/system/preference',
      meta: { title: '系统管理' },
      children: [
        {
          name: "参数",
          path: '/system/preference',
          component: Preference,
          meta: { title: '参数' }
        },
        {
          name: "离线任务",
          path: '/system/offlinetask',
          component: OfflineTask,
          meta: { title: '离线任务' }
        },
        {
          name: "用户",
          path: '/system/user',
          component: User,
          meta: { title: '用户' },
        }
      ]
    },
    {
      name: "dataManage",
      path: '/dataManage',
      component: Main,
      redirect:'/datamanage/dayagr',
      meta: { title: '数据报表' },
      children: [
        {
          name: "每日汇总",
          path: '/datamanage/dayagr',
          component: DayAgr,
          meta: { title: '每日汇总' }
        },
        {
          name: "商户汇总",
          path: '/datamanage/merchantagr',
          component: Merchantagr,
          meta: { title: '商户汇总' }
        },
        {
          name: "半小时渠道数据",
          path: '/datamanage/halfhouragr',
          component: Halfhouragr,
          meta: { title: '半小时渠道数据' }
        }
      ]
    },
  ]
})

router.beforeEach((to, from, next) => {
  // if (to.meta.requireLogin){  // 判断该路由是否需要登录权限
  //   if (JSON.parse(localStorage.getItem('islogin'))) {  // 判断当前用户的登录信息islogin是否存在
  //     next()
  //   } else {
  //     next({
  //       path: '/login'
  //     })
  //   }
  // } else {
  //   next()
  // }
  if (JSON.parse(localStorage.getItem('islogin'))) {  // 判断当前用户的登录信息islogin是否存在
    next()
  } else {
    console.log(to)
    if (to.name == 'login') {
      next()
    } else {
      next({
        path: '/login'
      })
    }
  }
})


export default router