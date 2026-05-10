import { createRouter, createWebHashHistory } from 'vue-router'

const Timeline = () => import('./views/Timeline.vue')
const Compose = () => import('./views/Compose.vue')
const Detail = () => import('./views/Detail.vue')
const Setup = () => import('./views/Setup.vue')

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'timeline', component: Timeline },
    { path: '/compose', name: 'compose', component: Compose },
    { path: '/post/:id', name: 'detail', component: Detail, props: true },
    { path: '/setup', name: 'setup', component: Setup },
    { path: '/:catchAll(.*)', redirect: '/' },
  ],
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    return { top: 0 }
  },
})
