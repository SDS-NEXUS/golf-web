<script setup>
import { ref, onMounted } from 'vue'
import { apiGet } from '../api'

const loading = ref(true)
const error = ref('')
const r = ref(null)

onMounted(async () => {
  try { r.value = await apiGet('/rules') }
  catch (e) { error.value = e.message }
  finally { loading.value = false }
})
</script>

<template>
  <div v-if="loading" class="loading">불러오는 중…</div>
  <div v-else-if="error" class="error">규정을 불러오지 못했습니다 ({{ error }})</div>
  <div v-else>
    <div class="card">
      <h2>라운드 포인트 배점</h2>
      <table>
        <thead><tr><th>순위</th><th>포인트</th></tr></thead>
        <tbody>
          <tr v-for="(p, i) in r.point_table" :key="i"><td>{{ i + 1 }}위</td><td>{{ p }}</td></tr>
          <tr><td>{{ r.point_table.length + 1 }}위 이후</td>
            <td class="muted">−{{ r.point_after_step }}점씩 (최소 {{ r.point_min }})</td></tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <h2>보너스 점수</h2>
      <table>
        <tbody>
          <tr><td>홀인원</td><td>+{{ r.bonus.hole_in_one }}</td></tr>
          <tr><td>알바트로스 / 이글 / 버디</td><td>+{{ r.bonus.albatross }} / +{{ r.bonus.eagle }} / +{{ r.bonus.birdie }}</td></tr>
          <tr><td>라운드 최저 그로스 / 백나인 베스트</td><td>+{{ r.bonus.best_gross }} / +{{ r.bonus.best_back9 }}</td></tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <h2>핸디캡 · 가중치</h2>
      <ul class="rule-list">
        <li>신페리오 핸디캡 — 범위 [{{ r.handicap.min }}, {{ r.handicap.max }}], 계수 {{ r.handicap.peoria_multiplier }}</li>
        <li>리그 상대 보정 계수 — {{ r.handicap.adj_coef }} (최근 {{ r.handicap.adj_window }}라운드)</li>
        <li>구장 난이도 — {{ r.difficulty.min }} ~ {{ r.difficulty.max }}, 기준 거리 {{ r.difficulty.reference_distance }}m</li>
        <li>라운드 최종 가중치 상한 — ×{{ r.max_effective_multiplier }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.rule-list { padding-left: 18px; font-size: 14px; }
.rule-list li { margin: 4px 0; }
</style>
