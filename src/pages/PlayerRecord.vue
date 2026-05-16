<script setup>
import { ref, onMounted } from 'vue'
import { apiGet } from '../api'

const props = defineProps({ id: String })
const loading = ref(true)
const error = ref('')
const d = ref(null)

const sgn = (v) => (v == null ? '−' : v > 0 ? '+' + v : String(v))
const fmtDate = (x) => (x ? String(x).slice(0, 10) : '')

onMounted(async () => {
  try { d.value = await apiGet('/records/' + props.id) }
  catch (e) { error.value = e.message }
  finally { loading.value = false }
})
</script>

<template>
  <div v-if="loading" class="loading">불러오는 중…</div>
  <div v-else-if="error" class="error">선수 기록을 불러오지 못했습니다 ({{ error }})</div>
  <div v-else-if="!d.stats" class="card"><p class="muted">확정된 라운드 기록이 없습니다.</p></div>
  <div v-else>
    <div class="card">
      <h2 :class="'gender-' + (d.member.gender || 'M')">{{ d.member.name }}</h2>
      <p class="muted">확정 라운드 기준 누적 스코어링 통계</p>
    </div>

    <!-- 스코어링 종합 -->
    <div class="card">
      <h2>스코어링 종합</h2>
      <div class="grid">
        <div class="tile"><span class="k">참가</span><span class="v">{{ d.stats.rounds }}R</span></div>
        <div class="tile"><span class="k">평균 그로스</span><span class="v">{{ d.stats.avg_gross }}</span></div>
        <div class="tile"><span class="k">베스트</span><span class="v" style="color:#198754">{{ d.stats.best.gross }}</span></div>
        <div class="tile"><span class="k">워스트</span><span class="v">{{ d.stats.worst.gross }}</span></div>
        <div class="tile"><span class="k">평균 Net</span><span class="v">{{ d.stats.avg_net }}</span></div>
        <div class="tile"><span class="k">라운드 기복(편차)</span><span class="v">±{{ d.stats.consistency }}</span></div>
        <div class="tile"><span class="k">라운드 1위</span><span class="v">{{ d.stats.wins }}회</span></div>
        <div class="tile"><span class="k">라운드 Top3</span><span class="v">{{ d.stats.top3 }}회</span></div>
        <div class="tile"><span class="k">리그 우승</span><span class="v" style="color:#c8860d">{{ d.league_wins }}회</span></div>
        <div class="tile"><span class="k">리그 Top3</span><span class="v" style="color:#c8860d">{{ d.league_top3 }}회</span></div>
        <div class="tile"><span class="k">통산 포인트</span><span class="v" style="color:#0d6efd">{{ Number(d.stats.points).toLocaleString() }}</span></div>
      </div>
    </div>

    <!-- 홀 분포 -->
    <div class="card">
      <h2>홀 분포 · 통산 {{ d.stats.hole_n }}홀
        <span v-if="d.stats.ace" class="ace-tag">통산 홀인원 {{ d.stats.ace }}</span>
      </h2>
      <div class="distbar">
        <div v-for="(seg, i) in [
            ['이글↑', d.stats.eagle, '#0d6efd'],
            ['버디', d.stats.birdie, '#198754'],
            ['파', d.stats.par, '#64748b'],
            ['보기', d.stats.bogey, '#f59e0b'],
            ['더블+', d.stats.double, '#dc3545']]" :key="i"
          v-show="seg[1] > 0"
          :style="{ width: (seg[1] / Math.max(1, d.stats.hole_n) * 100) + '%', background: seg[2] }">
          {{ seg[1] }}
        </div>
      </div>
      <div class="legend">
        <span v-for="(seg, i) in [
            ['이글↑', d.stats.eagle, '#0d6efd'],
            ['버디', d.stats.birdie, '#198754'],
            ['파', d.stats.par, '#64748b'],
            ['보기', d.stats.bogey, '#f59e0b'],
            ['더블+', d.stats.double, '#dc3545']]" :key="i">
          <i :style="{ background: seg[2] }"></i>{{ seg[0] }}
          <b>{{ seg[1] }}</b> ({{ Math.round(seg[1] / Math.max(1, d.stats.hole_n) * 100) }}%)
        </span>
      </div>
      <div class="grid" style="margin-top:10px">
        <div class="tile"><span class="k">라운드당 버디</span><span class="v">{{ d.stats.birdie_pr }}</span></div>
        <div class="tile"><span class="k">무보기 라운드</span><span class="v">{{ d.stats.bogey_free }}R</span></div>
        <div class="tile"><span class="k">홀당 평균(±par)</span><span class="v">{{ sgn(d.stats.avg_rel) }}</span></div>
      </div>
    </div>

    <div class="card">
      <h2>Par별 평균 타수</h2>
      <div class="grid">
        <div class="tile"><span class="k">Par 3</span><span class="v">{{ d.stats.par3_avg ?? '−' }}</span></div>
        <div class="tile"><span class="k">Par 4</span><span class="v">{{ d.stats.par4_avg ?? '−' }}</span></div>
        <div class="tile"><span class="k">Par 5</span><span class="v">{{ d.stats.par5_avg ?? '−' }}</span></div>
      </div>
    </div>

    <div class="card">
      <h2>구간별 평균</h2>
      <div class="grid">
        <div class="tile"><span class="k">전반 9홀</span><span class="v">{{ d.stats.front9 }}</span></div>
        <div class="tile"><span class="k">후반 9홀</span><span class="v">{{ d.stats.back9 }}</span></div>
        <div class="tile"><span class="k">첫 홀</span><span class="v">{{ d.stats.first_hole }}</span></div>
        <div class="tile"><span class="k">마지막 3홀</span><span class="v">{{ d.stats.last3 }}</span></div>
      </div>
    </div>

    <div class="card">
      <h2>난이도별 대응 (홀당 ±par)</h2>
      <div class="grid">
        <div class="tile"><span class="k">어려운 홀 (핸디 1~6)</span><span class="v">{{ sgn(d.stats.hard_rel) }}</span></div>
        <div class="tile"><span class="k">중간 홀 (7~12)</span><span class="v">{{ sgn(d.stats.mid_rel) }}</span></div>
        <div class="tile"><span class="k">쉬운 홀 (13~18)</span><span class="v">{{ sgn(d.stats.easy_rel) }}</span></div>
      </div>
    </div>

    <div class="card">
      <h2>안정성 · 멘탈</h2>
      <div class="grid">
        <div class="tile"><span class="k">파 세이브율</span><span class="v">{{ d.stats.par_save_rate }}%</span></div>
        <div class="tile"><span class="k">오버파 비율</span><span class="v">{{ d.stats.over_rate }}%</span></div>
        <div class="tile"><span class="k">더블보기 회피율</span><span class="v">{{ d.stats.dbl_avoid }}%</span></div>
        <div class="tile"><span class="k">바운스백 ({{ d.stats.bb_opp }}회 중)</span><span class="v">{{ d.stats.bounce_back ?? '−' }}%</span></div>
        <div class="tile"><span class="k">최다 연속 버디↑</span><span class="v">{{ d.stats.longest_birdie }}홀</span></div>
      </div>
    </div>

    <div class="card" v-if="d.season_rows && d.season_rows.length">
      <h2>시즌별 기록</h2>
      <table>
        <thead><tr><th>시즌</th><th>참가</th><th>평균</th><th>베스트</th><th>라운드 1위</th><th>시즌 포인트</th><th>시즌 순위</th></tr></thead>
        <tbody>
          <tr v-for="(sr, i) in d.season_rows" :key="i">
            <td style="font-weight:700">{{ sr.season.name }}</td>
            <td>{{ sr.rounds }}R</td>
            <td>{{ sr.avg_gross }}</td>
            <td style="color:#198754">{{ sr.best_gross }}</td>
            <td>{{ sr.wins ? sr.wins + '회' : '−' }}</td>
            <td>{{ sr.total != null ? Number(sr.total).toLocaleString() : '−' }}</td>
            <td style="font-weight:700">{{ sr.rank ? sr.rank + '위' : '−' }}<span v-if="sr.rank && !sr.qualified" class="muted"> 참고</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card" v-if="d.scores && d.scores.length">
      <h2>라운드별 기록</h2>
      <table>
        <thead><tr><th>날짜</th><th>구장</th><th>그로스</th><th>Net</th><th>순위</th><th>포인트</th></tr></thead>
        <tbody>
          <tr v-for="s in [...d.scores].reverse()" :key="s.id">
            <td>{{ fmtDate(s.round?.play_date) }}</td>
            <td>{{ s.round?.club?.name || '−' }}</td>
            <td style="font-weight:700">{{ s.gross }}</td>
            <td>{{ s.net }}</td>
            <td>{{ s.rank_no ? s.rank_no + '위' : '−' }}</td>
            <td style="color:#0d6efd">{{ (Number(s.points) || 0) + (Number(s.bonus_points) || 0) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
.tile { background: #f8fafc; border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; }
.tile .k { font-size: 11px; color: #64748b; }
.tile .v { font-size: 18px; font-weight: 800; }
.ace-tag { font-size: 11px; background: #dc3545; color: #fff; padding: 2px 7px; border-radius: 4px; margin-left: 6px; }

.distbar { display: flex; height: 26px; border-radius: 6px; overflow: hidden; }
.distbar > div { display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; font-weight: 700; min-width: 0; }
.legend { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; font-size: 12px; }
.legend span { color: #475569; }
.legend i { display: inline-block; width: 9px; height: 9px; border-radius: 2px; margin-right: 3px; }
</style>
