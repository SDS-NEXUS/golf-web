<script setup>
import { ref, onMounted } from 'vue'
import { apiGet } from '../api'

const loading = ref(true)
const error = ref('')
const data = ref(null)

onMounted(async () => {
  try {
    data.value = await apiGet('/season')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading" class="loading">불러오는 중…</div>
  <div v-else-if="error" class="error">랭킹을 불러오지 못했습니다 ({{ error }})</div>
  <div v-else>
    <div class="card">
      <h2>{{ data.season?.name || '시즌' }} 랭킹</h2>
      <table v-if="data.ranking && data.ranking.length">
        <thead>
          <tr><th>순위</th><th>선수</th><th>참가</th><th>총점</th></tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in data.ranking" :key="i">
            <td>{{ row.qualified ? i + 1 : '−' }}</td>
            <td :class="'gender-' + (row.member?.gender || 'M')" style="font-weight:700">
              {{ row.member?.name }}
            </td>
            <td>{{ row.played }}R</td>
            <td style="font-weight:700">{{ row.total }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="muted">아직 확정된 라운드가 없습니다.</p>
    </div>
  </div>
</template>
