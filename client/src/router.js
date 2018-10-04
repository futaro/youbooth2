import Vue         from 'vue'
import Router      from 'vue-router'
import VideoScreen from './views/VideoScreen'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path     : '/',
      name     : 'home',
      component: VideoScreen
    },
    {
      path     : '/:workspace/:channel',
      name     : 'booth',
      component: VideoScreen
    }
  ]
})
