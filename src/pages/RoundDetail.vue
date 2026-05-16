<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiGet } from '../api'

const props = defineProps({ id: String })
const loading = ref(true)
const error = ref('')
const d = ref(null)
const DOW = ['일', '월', '화', '수', '목', '금', '토']

const totalPar = computed(() => (d.value?.par || []).reduce((a, b) => a + Number(b || 0), 0))
const ranked = computed(() =>
  [...(d.value?.round?.scores || [])].sort((a, b) => (a.rank_no ?? 999) - (b.rank_no ?? 999))
)
const isGuest = (m) => m && !m.active && m.memo === '게스트'
const rankCls = (n) => (n === 1 ? 'first' : n === 2 ? 'second' : n === 3 ? 'third' : '')
const dow = (s) => DOW[new Date(String(s).slice(0, 10)).getDay()]

onMounted(async () => {
  try { d.value = await apiGet('/rounds/' + props.id) }
  catch (e) { error.value = e.message }
  finally { loading.value = false }
})
</script>

<template>
  <div v-if="loading" class="loading">불러오는 중…</div>
  <div v-else-if="error" class="error">라운드를 불러오지 못했습니다</div>
  <div v-else>
    <div class="section-title">라운드 정보</div>
    <div class="info-card">
      <div class="row-l"><span>일시</span><strong>{{ String(d.round.play_date).slice(0, 10) }} ({{ dow(d.round.play_date) }})</strong></div>
      <div class="row-l"><span>구장</span><strong>{{ d.round.club?.name }}</strong></div>
      <div class="row-l"><span>전반 / 후반</span><strong>{{ d.round.front_course?.course_name }} / {{ d.round.back_course?.course_name }}</strong></div>
      <div class="row-l"><span>Par</span><strong>{{ totalPar }}</strong></div>
      <div class="row-l"><span>상태</span>
        <span v-if="d.round.finalized" class="badge bg-success">확정</span>
        <span v-else class="badge bg-secondary">진행중</span>
      </div>
      <template v-if="d.round.finalized && (d.effective_multiplier != 1 || (d.difficulty && d.difficulty.factor != 1))">
        <div class="row-l"><span>라운드 가중치</span><strong class="text-warning">×{{ Number(d.effective_multiplier).toFixed(2) }}</strong></div>
        <div class="row-l"><span class="text-muted">순번 × 구장 난이도</span>
          <span class="text-muted">×{{ Number(d.base_multiplier).toFixed(1) }} × ×{{ Number(d.difficulty.factor).toFixed(2) }}</span></div>
      </template>
    </div>

    <template v-if="d.round.finalized && d.hidden && d.hidden.length">
      <div class="section-title">히든 12홀</div>
      <div class="info-card">
        <span v-for="h in d.hidden" :key="h" class="badge bg-warning text-dark me-1 mb-1">{{ h }}H</span>
      </div>
    </template>

    <div class="section-title">결과</div>
    <div v-for="r in ranked" :key="r.id" class="rank-row">
      <div class="rank-no" :class="rankCls(r.rank_no)">{{ isGuest(r.member) ? 'G' : (r.rank_no ?? '-') }}</div>
      <div style="flex:1;">
        <div class="member-name">
          <span :class="'gender-' + (r.member?.gender || 'M')">{{ r.member?.name }}</span>
          <span class="badge-soft ms-1">{{ r.member?.gender === 'F' ? '여' : '남' }}</span>
          <span v-if="isGuest(r.member)" class="badge bg-secondary ms-1" style="font-size:10px;">게스트</span>
        </div>
        <div class="member-meta">
          <template v-if="r.gross !== null && r.gross !== undefined">
            Gross {{ r.gross }}<template v-if="totalPar"> ({{ r.gross - totalPar > 0 ? '+' : '' }}{{ r.gross - totalPar === 0 ? 'E' : r.gross - totalPar }})</template>
            · H {{ r.handicap }} · Net {{ r.adjusted_net }}
          </template>
          <template v-else>미입력</template>
        </div>
        <div v-if="r.bonus_breakdown && r.bonus_breakdown.length" class="member-meta text-success">
          <span v-for="(b, bi) in r.bonus_breakdown" :key="bi">{{ b.label }} +{{ b.points }}<template v-if="bi < r.bonus_breakdown.length - 1">, </template></span>
        </div>
      </div>
      <div class="text-end">
        <div class="pts">{{ (Number(r.points) || 0) + (Number(r.bonus_points) || 0) }}</div>
        <small>P {{ r.points ?? 0 }}<template v-if="(r.bonus_points ?? 0) > 0"> +{{ r.bonus_points }}</template></small>
      </div>
    </div>

    <div v-if="!d.round.finalized" class="info-card text-center text-muted mt-3" style="font-size:12px;">
      결과 확정 전입니다. 확정 후 순위와 포인트가 부여됩니다.
    </div>
  </div>
</template>
