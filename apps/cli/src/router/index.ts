import { createRouter, createWebHistory } from 'vue-router'
import CliView from '../CliView.vue'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [{ path: '/', name: 'cli', component: CliView }],
})

export default router
