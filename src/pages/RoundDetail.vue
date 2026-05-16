<script setup>
import { ref, onMounted } from 'vue'
import { apiGet } from '../api'

const props = defineProps({ id: String })
const loading = ref(true)
const error = ref('')
const data = ref(null)

onMounted(async () => {
  try { data.value = await apiGet('/rounds/' + props.id) }
  catch (e) { error.value = e.message }
  finally { loading.value = false }
})
</script>

<template>
  <div v-if="loading" class="loading">불러오는 중…</div>
  <div v-else-if="error" class="error">라운드를 불러오지 못했습니다 ({{ error }})</div>
  <div v-else>
    <div class="card">
      <h2>{{ String(data.round.play_date).slice(0, 10) }} · {{ data.round.club?.name }}</h2>
      <p class="muted">
        {{ data.round.front_course?.course_name }} + {{ data.round.back_course?.course_name }}
        · {{ data.round.finalized ? '확정' : '진행중' }}
      </p>
      <p v-if="data.round.finalized && data.effective_multiplier != 1" class="weight">
        라운드 가중치 ×{{ Number(data.effective_multiplier).toFixed(2) }}
        <span class="muted">(순번 ×{{ data.base_multiplier }} × 구장 난이도 ×{{ Number(data.difficulty?.factor || 1).toFixed(2) }})</span>
      </p>
    </div>

    <div class="card" v-if="data.round.scores && data.round.scores.length">
      <h2>스코어</h2>
      <table>
        <thead><tr><th>순위</th><th>선수</th><th>그로스</th><th>Net</th><th>포인트</th></tr></thead>
        <tbody>
          <tr v-for="s in data.round.scores" :key="s.id">
            <td>{{ s.rank_no || '−' }}</td>
            <td :class="'gender-' + (s.member?.gender || 'M')" style="font-weight:700">{{ s.member?.name }}</td>
            <td>{{ s.gross ?? '−' }}</td>
            <td>{{ s.net ?? '−' }}</td>
            <td style="font-weight:700;color:#0d6efd">{{ (Number(s.points) || 0) + (Number(s.bonus_points) || 0) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card" v-if="data.round.finalized && data.hidden && data.hidden.length">
      <h2>히든홀</h2>
      <span v-for="h in data.hidden" :key="h" class="hidden-badge">{{ h }}H</span>
    </div>
  </div>
</template>

<style scoped>
.weight { color: #b45309; font-size: 13px; margin-top: 6px; }
.hidden-badge {
  display: inline-block; background: #fef3c7; color: #92400e;
  padding: 2px 8px; border-radius: 4px; margin: 2px; font-size: 12px; font-weight: 600;
}
</style>
