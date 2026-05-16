import { createRouter, createWebHashHistory } from 'vue-router'

// 정적 호스팅(GitHub Pages)에서 서버 설정 없이 동작하도록 hash 모드 사용
const routes = [
  { path: '/',             name: 'dashboard', component: () => import('./pages/Dashboard.vue') },
  { path: '/rounds',       name: 'rounds',    component: () => import('./pages/Rounds.vue') },
  { path: '/rounds/:id',   name: 'round',     component: () => import('./pages/RoundDetail.vue'), props: true },
  { path: '/records',      name: 'records',   component: () => import('./pages/Records.vue') },
  { path: '/records/:id',  name: 'player',    component: () => import('./pages/PlayerRecord.vue'), props: true },
  { path: '/rules',        name: 'rules',     component: () => import('./pages/Rules.vue') },
  { path: '/admin',        name: 'admin',     component: () => import('./pages/Admin.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
