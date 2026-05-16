<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { apiGet } from '../api'

const loading = ref(true)
const error = ref('')
const data = ref(null)

const DOW = ['일', '월', '화', '수', '목', '금', '토']
function fmtRoundDate(d) {
  if (!d) return ''
  const dt = new Date(String(d).slice(0, 10))
  return String(d).slice(0, 10) + ' (' + DOW[dt.getDay()] + ')'
}
function rankClass(row, i) {
  if (!row.qualified) return 'unq'
  return i === 0 ? 'first' : i === 1 ? 'second' : i === 2 ? 'third' : ''
}

onMounted(async () => {
  try { data.value = await apiGet('/season') }
  catch (e) { error.value = e.message }
  finally { loading.value = false }
})
</script>

<template>
  <div v-if="loading" class="loading">불러오는 중…</div>
  <div v-else-if="error" class="error">랭킹을 불러오지 못했습니다 ({{ error }})</div>
  <div v-else>
    <template v-if="!data.season">
      <div class="info-card text-center text-muted">시즌이 설정되지 않았습니다.</div>
    </template>
    <template v-else-if="!data.ranking || !data.ranking.length">
      <div class="info-card text-center text-muted">아직 확정된 라운드가 없습니다.</div>
    </template>
    <template v-else>
      <div class="section-title">{{ data.season.name }} 랭킹</div>
      <div v-for="(row, i) in data.ranking" :key="i" class="rank-row">
        <div class="rank-no" :class="rankClass(row, i)">{{ row.qualified ? i + 1 : '−' }}</div>
        <div style="flex:1; min-width:0;">
          <div class="member-name">
            <span :class="'gender-' + (row.member.gender || 'M')">{{ row.member.name }}</span>
            <span class="badge-soft ms-1">{{ row.member.gender === 'F' ? '여' : '남' }}</span>
          </div>
          <div class="member-meta">
            참여 {{ row.played }}R · 카운트 {{ row.kept_n }}R · 드롭 {{ row.dropped_n }}R
            <template v-if="!row.qualified"> · <span class="text-secondary">자격 미달</span></template>
          </div>
        </div>
        <div class="text-end">
          <div class="pts">{{ row.total }}</div>
          <small v-if="(row.bonus_total || 0) > 0">(보너스 +{{ row.bonus_total }})</small>
        </div>
      </div>
    </template>

    <div class="section-title">라운드 (탭하여 결과 보기)</div>
    <template v-if="data.recent_rounds && data.recent_rounds.length">
      <RouterLink v-for="r in data.recent_rounds" :key="r.id" :to="'/rounds/' + r.id"
        class="rank-row text-dark" style="min-width:0;">
        <i class="fa-solid fa-flag text-success" style="font-size:18px; flex-shrink:0;"></i>
        <div style="flex:1; min-width:0; overflow:hidden;">
          <div class="member-name" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            {{ fmtRoundDate(r.play_date) }} · {{ r.club?.name }}
          </div>
          <div class="member-meta" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            {{ r.front_course?.course_name }} / {{ r.back_course?.course_name }}
          </div>
        </div>
        <div style="flex-shrink:0;">
          <span v-if="r.finalized" class="badge bg-success">확정</span>
          <span v-else class="badge bg-secondary">진행</span>
        </div>
      </RouterLink>
    </template>
    <div v-else class="info-card text-center text-muted">등록된 라운드 없음</div>
  </div>
</template>
