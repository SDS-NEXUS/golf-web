<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { apiGet } from './api'

const season = ref(null)
const played = ref(0)

onMounted(async () => {
  try {
    const d = await apiGet('/season')
    season.value = d.season
    played.value = (d.recent_rounds || []).filter((r) => r.finalized).length
  } catch (e) { /* 헤더 정보 없이도 진행 */ }
})
</script>

<template>
  <div class="gtg-m-header">
    <RouterLink to="/admin" class="gtg-m-gear"><i class="fa-solid fa-gear"></i></RouterLink>
    <h1 class="gtg-m-title"><i class="fa-solid fa-golf-ball-tee me-1"></i>골때리는골프</h1>
    <div class="gtg-m-sub">
      <template v-if="season">
        {{ season.name }} · {{ played }}/{{ season.planned_rounds }} 라운드 진행
      </template>
      <template v-else>시즌</template>
    </div>
  </div>

  <div class="gtg-m-tabs">
    <RouterLink to="/"><i class="fa-solid fa-trophy"></i> 랭킹</RouterLink>
    <RouterLink to="/rounds"><i class="fa-solid fa-flag"></i> 라운드</RouterLink>
    <RouterLink to="/records"><i class="fa-solid fa-chart-line"></i> 통산 기록</RouterLink>
    <RouterLink to="/rules"><i class="fa-solid fa-book"></i> 규정</RouterLink>
  </div>

  <div class="gtg-m-content">
    <RouterView />
  </div>
</template>
