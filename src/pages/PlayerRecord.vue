<script setup>
import { ref, onMounted } from 'vue'
import { apiGet } from '../api'

const props = defineProps({ id: String })
const loading = ref(true)
const error = ref('')
const d = ref(null)

const sgn = (v) => (v == null ? '−' : v > 0 ? '+' + v : String(v))

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

    <div class="card">
      <h2>스코어링 종합</h2>
      <div class="grid">
        <div class="tile"><span class="k">참가</span><span class="v">{{ d.stats.rounds }}R</span></div>
        <div class="tile"><span class="k">평균 그로스</span><span class="v">{{ d.stats.avg_gross }}</span></div>
        <div class="tile"><span class="k">베스트</span><span class="v" style="color:#198754">{{ d.stats.best.gross }}</span></div>
        <div class="tile"><span class="k">평균 Net</span><span class="v">{{ d.stats.avg_net }}</span></div>
        <div class="tile"><span class="k">기복(편차)</span><span class="v">±{{ d.stats.consistency }}</span></div>
        <div class="tile"><span class="k">라운드 1위</span><span class="v">{{ d.stats.wins }}</span></div>
        <div class="tile"><span class="k">라운드 Top3</span><span class="v">{{ d.stats.top3 }}</span></div>
        <div class="tile"><span class="k">리그 우승</span><span class="v" style="color:#c8860d">{{ d.league_wins }}</span></div>
        <div class="tile"><span class="k">리그 Top3</span><span class="v" style="color:#c8860d">{{ d.league_top3 }}</span></div>
        <div class="tile"><span class="k">통산 포인트</span><span class="v" style="color:#0d6efd">{{ Number(d.stats.points).toLocaleString() }}</span></div>
      </div>
    </div>

    <div class="card">
      <h2>홀 분포 · 통산 {{ d.stats.hole_n }}홀</h2>
      <div class="grid">
        <div class="tile"><span class="k">이글↑</span><span class="v">{{ d.stats.eagle }}</span></div>
        <div class="tile"><span class="k">버디</span><span class="v">{{ d.stats.birdie }}</span></div>
        <div class="tile"><span class="k">파</span><span class="v">{{ d.stats.par }}</span></div>
        <div class="tile"><span class="k">보기</span><span class="v">{{ d.stats.bogey }}</span></div>
        <div class="tile"><span class="k">더블+</span><span class="v">{{ d.stats.double }}</span></div>
        <div class="tile"><span class="k">홀인원</span><span class="v">{{ d.stats.ace }}</span></div>
        <div class="tile"><span class="k">라운드당 버디</span><span class="v">{{ d.stats.birdie_pr }}</span></div>
        <div class="tile"><span class="k">무보기 라운드</span><span class="v">{{ d.stats.bogey_free }}R</span></div>
      </div>
    </div>

    <div class="card">
      <h2>Par별 · 구간별 · 난이도별</h2>
      <div class="grid">
        <div class="tile"><span class="k">Par3 / 4 / 5</span><span class="v">{{ d.stats.par3_avg }} / {{ d.stats.par4_avg }} / {{ d.stats.par5_avg }}</span></div>
        <div class="tile"><span class="k">전반 / 후반 9홀</span><span class="v">{{ d.stats.front9 }} / {{ d.stats.back9 }}</span></div>
        <div class="tile"><span class="k">첫 홀 / 마지막 3홀</span><span class="v">{{ d.stats.first_hole }} / {{ d.stats.last3 }}</span></div>
        <div class="tile"><span class="k">난홀 / 중간 / 쉬운홀 (±par)</span><span class="v">{{ sgn(d.stats.hard_rel) }} / {{ sgn(d.stats.mid_rel) }} / {{ sgn(d.stats.easy_rel) }}</span></div>
        <div class="tile"><span class="k">파 세이브율</span><span class="v">{{ d.stats.par_save_rate }}%</span></div>
        <div class="tile"><span class="k">바운스백</span><span class="v">{{ d.stats.bounce_back ?? '−' }}%</span></div>
        <div class="tile"><span class="k">더블 회피율</span><span class="v">{{ d.stats.dbl_avoid }}%</span></div>
        <div class="tile"><span class="k">최다 연속 버디↑</span><span class="v">{{ d.stats.longest_birdie }}홀</span></div>
      </div>
    </div>

    <div class="card" v-if="d.season_rows && d.season_rows.length">
      <h2>시즌별 기록</h2>
      <table>
        <thead><tr><th>시즌</th><th>참가</th><th>평균</th><th>라운드 1위</th><th>시즌 순위</th></tr></thead>
        <tbody>
          <tr v-for="(sr, i) in d.season_rows" :key="i">
            <td style="font-weight:700">{{ sr.season.name }}</td>
            <td>{{ sr.rounds }}R</td>
            <td>{{ sr.avg_gross }}</td>
            <td>{{ sr.wins }}</td>
            <td>{{ sr.rank ? sr.rank + '위' : '−' }}<span v-if="sr.rank && !sr.qualified" class="muted"> 참고</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; }
.tile { background: #f8fafc; border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; }
.tile .k { font-size: 11px; color: #64748b; }
.tile .v { font-size: 17px; font-weight: 800; }
</style>
