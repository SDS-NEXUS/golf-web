<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <div class="wrap hdr">
      <h1>골때리는골프</h1>
      <nav>
        <RouterLink to="/">랭킹</RouterLink>
        <RouterLink to="/rounds">라운드</RouterLink>
        <RouterLink to="/records">통산 기록</RouterLink>
        <RouterLink to="/rules">포인트 규정</RouterLink>
        <RouterLink to="/admin" class="gear">설정</RouterLink>
      </nav>
    </div>
  </header>
  <main class="wrap main">
    <RouterView />
  </main>
</template>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #0f5132 0%, #198754 60%, #20c997 100%);
  color: #fff;
}
.hdr { padding: 16px; }
.app-header h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
nav { display: flex; gap: 4px; margin-top: 10px; flex-wrap: wrap; }
nav a {
  padding: 8px 12px; font-size: 14px; font-weight: 600;
  color: #d1fae5; border-radius: 6px;
}
nav a.router-link-exact-active { background: rgba(255, 255, 255, 0.18); color: #fff; }
nav a.gear { margin-left: auto; color: #a7f3d0; }
.main { padding: 16px; }
</style>
