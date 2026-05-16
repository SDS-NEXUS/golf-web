<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { apiGet } from '../api'

const props = defineProps({ id: String })
const loading = ref(true)
const error = ref('')
const d = ref(null)

const sgn = (v) => (v == null ? '−' : v > 0 ? '+' + v : String(v))
const nameColor = (g) => (g === 'F' ? '#e6007e' : '#0d6efd')
const genderLabel = (g) => (g === 'F' ? '여' : '남')

const segs = computed(() => {
  if (!d.value?.stats) return []
  const s = d.value.stats
  return [
    ['이글↑', s.eagle, '#0d6efd'],
    ['버디', s.birdie, '#198754'],
    ['파', s.par, '#64748b'],
    ['보기', s.bogey, '#f59e0b'],
    ['더블+', s.double, '#dc3545'],
  ]
})
const holeN = computed(() => Math.max(1, d.value?.stats?.hole_n || 1))
const logScores = computed(() =>
  [...(d.value?.scores || [])].sort(
    (a, b) => new Date(b.round?.play_date || 0) - new Date(a.round?.play_date || 0)
  )
)
const ymd = (x) => (x ? String(x).slice(2, 10).replace(/-/g, '.') : '')

onMounted(async () => {
  try { d.value = await apiGet('/records/' + props.id) }
  catch (e) { error.value = e.message }
  finally { loading.value = false }
})
</script>

<template>
  <div v-if="loading" class="loading">불러오는 중…</div>
  <div v-else-if="error" class="error">선수 기록을 불러오지 못했습니다</div>
  <div v-else>
    <RouterLink to="/records" style="font-size:12px;color:#64748b;">
      <i class="fa-solid fa-arrow-left"></i> 통산 기록
    </RouterLink>
    <div class="pr-h">
      <span class="nm" :style="{ color: nameColor(d.member.gender) }">{{ d.member.name }}</span>
      <span class="gb" :style="{ background: nameColor(d.member.gender) }">{{ genderLabel(d.member.gender) }}</span>
    </div>
    <p class="text-muted" style="font-size:11px;margin:-4px 0 8px 2px;">확정 라운드 기준 누적 스코어링 통계</p>

    <div v-if="!d.stats" class="info-card text-center text-muted">확정된 라운드 기록이 없습니다.</div>
    <template v-else>
      <div class="pr-sec">스코어링 종합</div>
      <div class="pr-grid">
        <div class="pr-t"><div class="k">참가</div><div class="v">{{ d.stats.rounds }}<small>R</small></div></div>
        <div class="pr-t"><div class="k">평균 그로스</div><div class="v">{{ d.stats.avg_gross }}</div></div>
        <div class="pr-t"><div class="k">평균 Net</div><div class="v">{{ d.stats.avg_net }}</div></div>
        <div class="pr-t"><div class="k">베스트</div><div class="v text-success">{{ d.stats.best.gross }}</div></div>
        <div class="pr-t"><div class="k">워스트</div><div class="v">{{ d.stats.worst.gross }}</div></div>
        <div class="pr-t"><div class="k">기복(편차)</div><div class="v">±{{ d.stats.consistency }}</div></div>
        <div class="pr-t"><div class="k">라운드 1위</div><div class="v">{{ d.stats.wins }}<small>회</small></div></div>
        <div class="pr-t"><div class="k">라운드 Top3</div><div class="v">{{ d.stats.top3 }}<small>회</small></div></div>
        <div class="pr-t"><div class="k">리그 우승</div><div class="v" style="color:#c8860d">{{ d.league_wins }}<small>회</small></div></div>
        <div class="pr-t"><div class="k">리그 Top3</div><div class="v" style="color:#c8860d">{{ d.league_top3 }}<small>회</small></div></div>
        <div class="pr-t"><div class="k">통산 포인트</div><div class="v text-primary">{{ Number(d.stats.points).toLocaleString() }}</div></div>
      </div>

      <div class="pr-sec">홀 분포 · 통산 {{ d.stats.hole_n }}홀
        <span v-if="d.stats.ace" style="color:#dc3545;">· 홀인원 {{ d.stats.ace }}</span>
      </div>
      <div class="pr-distbar">
        <div v-for="(sg, i) in segs" :key="i" v-show="sg[1] > 0"
          :style="{ width: (sg[1] / holeN * 100) + '%', background: sg[2] }">{{ sg[1] }}</div>
      </div>
      <div style="font-size:10px;display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
        <span v-for="(sg, i) in segs" :key="i">
          <span :style="{ color: sg[2] }">●</span> {{ sg[0] }} <strong>{{ sg[1] }}</strong> ({{ Math.round(sg[1] / holeN * 100) }}%)
        </span>
      </div>
      <div class="pr-grid">
        <div class="pr-t"><div class="k">라운드당 버디</div><div class="v">{{ d.stats.birdie_pr }}</div></div>
        <div class="pr-t"><div class="k">무보기 라운드</div><div class="v">{{ d.stats.bogey_free }}<small>R</small></div></div>
        <div class="pr-t"><div class="k">홀당 평균</div><div class="v">{{ sgn(d.stats.avg_rel) }}</div></div>
      </div>

      <div class="pr-sec">Par별 평균 타수</div>
      <div class="pr-grid">
        <div class="pr-t"><div class="k">Par 3</div><div class="v">{{ d.stats.par3_avg ?? '−' }}</div></div>
        <div class="pr-t"><div class="k">Par 4</div><div class="v">{{ d.stats.par4_avg ?? '−' }}</div></div>
        <div class="pr-t"><div class="k">Par 5</div><div class="v">{{ d.stats.par5_avg ?? '−' }}</div></div>
      </div>

      <div class="pr-sec">구간별 평균</div>
      <div class="pr-grid c2">
        <div class="pr-t"><div class="k">전반 9홀</div><div class="v">{{ d.stats.front9 }}</div></div>
        <div class="pr-t"><div class="k">후반 9홀</div><div class="v">{{ d.stats.back9 }}</div></div>
        <div class="pr-t"><div class="k">첫 홀</div><div class="v">{{ d.stats.first_hole }}</div></div>
        <div class="pr-t"><div class="k">마지막 3홀</div><div class="v">{{ d.stats.last3 }}</div></div>
      </div>

      <div class="pr-sec">난이도별 대응 (홀당 ±par)</div>
      <div class="pr-grid">
        <div class="pr-t"><div class="k">어려운 홀<br>1~6</div><div class="v">{{ sgn(d.stats.hard_rel) }}</div></div>
        <div class="pr-t"><div class="k">중간 홀<br>7~12</div><div class="v">{{ sgn(d.stats.mid_rel) }}</div></div>
        <div class="pr-t"><div class="k">쉬운 홀<br>13~18</div><div class="v">{{ sgn(d.stats.easy_rel) }}</div></div>
      </div>

      <div class="pr-sec">안정성 · 멘탈</div>
      <div class="pr-grid">
        <div class="pr-t"><div class="k">파 세이브율</div><div class="v">{{ d.stats.par_save_rate }}<small>%</small></div></div>
        <div class="pr-t"><div class="k">오버파 비율</div><div class="v">{{ d.stats.over_rate }}<small>%</small></div></div>
        <div class="pr-t"><div class="k">더블 회피율</div><div class="v">{{ d.stats.dbl_avoid }}<small>%</small></div></div>
        <div class="pr-t"><div class="k">바운스백</div><div class="v">{{ d.stats.bounce_back ?? '−' }}<small>%</small></div></div>
        <div class="pr-t"><div class="k">최다 연속 버디↑</div><div class="v">{{ d.stats.longest_birdie }}<small>홀</small></div></div>
      </div>

      <div class="pr-sec">시즌별 기록</div>
      <div class="pr-log">
        <table class="table table-sm">
          <thead class="table-light">
            <tr><th>시즌</th><th class="text-end">참가</th><th class="text-end">평균</th><th class="text-end">1위</th><th class="text-end">시즌 순위</th></tr>
          </thead>
          <tbody>
            <tr v-for="(sr, i) in d.season_rows" :key="i">
              <td>{{ sr.season.name }}<span v-if="sr.season.is_current" class="badge-soft"> 진행</span></td>
              <td class="text-end">{{ sr.rounds }}R</td>
              <td class="text-end">{{ sr.avg_gross }}</td>
              <td class="text-end">{{ sr.wins }}</td>
              <td class="text-end fw-bold">{{ sr.rank ? sr.rank + '위' : '−' }}<span v-if="sr.rank && !sr.qualified" class="text-muted"> 참고</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pr-sec">라운드별 기록</div>
      <div class="pr-log">
        <table class="table table-sm table-hover">
          <thead class="table-light">
            <tr><th>날짜</th><th>구장</th><th class="text-end">그로스</th><th class="text-end">Net</th><th class="text-end">순위</th></tr>
          </thead>
          <tbody>
            <tr v-for="s in logScores" :key="s.id">
              <td>{{ ymd(s.round?.play_date) }}</td>
              <td>{{ s.round?.club?.name || '−' }}</td>
              <td class="text-end fw-bold">{{ s.gross }}</td>
              <td class="text-end">{{ s.net }}</td>
              <td class="text-end">{{ s.rank_no ? s.rank_no + '위' : '−' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="text-muted" style="font-size:10px;padding:6px 4px;">
        그로스·Par별·구간별은 핸디캡 보정 전 실제 타수. 비거리·퍼팅 등 샷 단위 지표는 데이터에 없어 제외.
      </p>
    </template>
  </div>
</template>

<style scoped>
.pr-h { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.pr-h .nm { font-size: 20px; font-weight: 800; }
.pr-h .gb { font-size: 11px; color: #fff; padding: 2px 8px; border-radius: 999px; }
.pr-sec { font-size: 12px; font-weight: 700; color: #475569; margin: 14px 4px 6px; text-transform: uppercase; letter-spacing: .5px; }
.pr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.pr-grid.c2 { grid-template-columns: repeat(2, 1fr); }
.pr-t { background: #fff; border-radius: 8px; padding: 8px 6px; text-align: center; }
.pr-t .k { font-size: 9px; color: #64748b; line-height: 1.2; }
.pr-t .v { font-size: 16px; font-weight: 800; color: #0f172a; }
.pr-t .v small { font-size: 9px; color: #64748b; font-weight: 600; }
.pr-distbar { display: flex; height: 20px; border-radius: 5px; overflow: hidden; margin-bottom: 6px; }
.pr-distbar > div { display: flex; align-items: center; justify-content: center; font-size: 9px; color: #fff; font-weight: 700; }
.pr-log { background: #fff; border-radius: 10px; overflow: hidden; }
.pr-log table { font-size: 11px; margin: 0; }
.pr-log td, .pr-log th { padding: 6px 8px; }
</style>
