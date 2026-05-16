<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { apiGet } from '../api'

const loading = ref(true)
const error = ref('')
const rounds = ref([])
const DOW = ['일', '월', '화', '수', '목', '금', '토']
const dko = (d) => (d ? DOW[new Date(String(d).slice(0, 10)).getDay()] : '')

onMounted(async () => {
  try { rounds.value = (await apiGet('/rounds')).rounds || [] }
  catch (e) { error.value = e.message }
  finally { loading.value = false }
})
</script>

<template>
  <div v-if="loading" class="loading">불러오는 중…</div>
  <div v-else-if="error" class="error">라운드를 불러오지 못했습니다</div>
  <div v-else>
    <div class="section-title">전체 라운드</div>
    <template v-if="rounds.length">
      <RouterLink v-for="r in rounds" :key="r.id" :to="'/rounds/' + r.id" class="rank-row text-dark">
        <i class="fa-solid fa-flag text-success" style="font-size:20px;"></i>
        <div style="flex:1; min-width:0;">
          <div class="member-name">{{ String(r.play_date).slice(0, 10) }} ({{ dko(r.play_date) }})</div>
          <div class="member-meta">
            {{ r.club?.name }}<br>
            {{ r.front_course?.course_name }} / {{ r.back_course?.course_name }}
          </div>
        </div>
        <div class="text-end">
          <span v-if="r.finalized" class="badge bg-success">확정</span>
          <span v-else class="badge bg-secondary">진행중</span>
        </div>
      </RouterLink>
    </template>
    <div v-else class="info-card text-center text-muted">등록된 라운드가 없습니다.</div>
  </div>
</template>
