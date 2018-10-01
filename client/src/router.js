import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes : [
    {
      path : '/',
      name : 'home',
      component : () => import('./views/WebSocketTest.vue')
    },
    {
      path : '/:workspace/:channel',
      name : 'booth',
      component : () => import('./views/WebSocketTest.vue')
    }
  ]
})
