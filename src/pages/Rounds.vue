<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { apiGet } from '../api'

const loading = ref(true)
const error = ref('')
const rounds = ref([])

function fmtDate(d) {
  return d ? String(d).slice(0, 10) : ''
}

onMounted(async () => {
  try {
    const data = await apiGet('/rounds')
    rounds.value = data.rounds || []
  } catch (e) { error.value = e.message }
  finally { loading.value = false }
})
</script>

<template>
  <div v-if="loading" class="loading">불러오는 중…</div>
  <div v-else-if="error" class="error">라운드를 불러오지 못했습니다 ({{ error }})</div>
  <div v-else class="card">
    <h2>라운드</h2>
    <table v-if="rounds.length">
      <thead><tr><th>날짜</th><th>구장</th><th>코스</th><th>상태</th></tr></thead>
      <tbody>
        <tr v-for="r in rounds" :key="r.id">
          <td>
            <RouterLink :to="'/rounds/' + r.id" style="font-weight:700;color:#198754">
              {{ fmtDate(r.play_date) }}
            </RouterLink>
          </td>
          <td>{{ r.club?.name || '−' }}</td>
          <td class="muted">{{ r.front_course?.course_name }} + {{ r.back_course?.course_name }}</td>
          <td>
            <span :class="r.finalized ? 'st-fin' : 'st-open'">
              {{ r.finalized ? '확정' : '진행중' }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else class="muted">등록된 라운드가 없습니다.</p>
  </div>
</template>

<style scoped>
.st-fin { color: #198754; font-weight: 700; }
.st-open { color: #94a3b8; }
</style>
