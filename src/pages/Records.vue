<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { apiGet } from '../api'

const loading = ref(true)
const error = ref('')
const data = ref(null)

const champLabels = (s) => (s.is_current ? ['현재 1위', '2위', '3위'] : ['우승', '준우승', '3위'])

onMounted(async () => {
  try { data.value = await apiGet('/records') }
  catch (e) { error.value = e.message }
  finally { loading.value = false }
})
</script>

<template>
  <div v-if="loading" class="loading">불러오는 중…</div>
  <div v-else-if="error" class="error">통산 기록을 불러오지 못했습니다 ({{ error }})</div>
  <div v-else>
    <!-- 역대 최저타 -->
    <div v-if="data.best_ever" class="card hero">
      <div class="hero-label">역대 최저타 · BEST GROSS</div>
      <div class="hero-num">
        {{ data.best_ever.best_gross }}
        <span class="hero-name">{{ data.best_ever.member.name }}</span>
      </div>
    </div>

    <!-- 역대 시즌 우승자 -->
    <div v-if="data.season_champs && data.season_champs.length" class="card">
      <h2>역대 시즌 우승자</h2>
      <table>
        <thead><tr><th>시즌</th><th>시즌 순위</th><th></th><th></th></tr></thead>
        <tbody>
          <tr v-for="(sc, i) in data.season_champs" :key="i">
            <td style="font-weight:700">
              {{ sc.season.name }}
              <span v-if="sc.season.is_current" class="tag">진행중</span>
            </td>
            <td v-for="n in 3" :key="n">
              <div class="muted" style="font-size:11px">{{ champLabels(sc.season)[n - 1] }}</div>
              <template v-if="sc.top[n - 1]">
                <RouterLink :to="'/records/' + sc.top[n - 1].member.id"
                  :class="'gender-' + (sc.top[n - 1].member.gender || 'M')" style="font-weight:600">
                  {{ sc.top[n - 1].member.name }}
                </RouterLink>
                <span class="muted"> {{ Number(sc.top[n - 1].total).toLocaleString() }}</span>
              </template>
              <span v-else class="muted">−</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="muted" style="margin-top:6px">진행중 시즌은 잠정 순위입니다.</p>
    </div>

    <!-- 선수별 통산 기록 -->
    <div class="card">
      <h2>선수별 통산 기록</h2>
      <div class="scroll">
        <table>
          <thead>
            <tr><th>#</th><th>선수</th><th>참가</th><th>평균 그로스</th><th>베스트</th><th>평균 Net</th><th>라운드 1위</th><th>통산 포인트</th><th>이벤트</th></tr>
          </thead>
          <tbody>
            <tr v-for="(c, i) in data.careers" :key="i">
              <td class="muted">{{ i + 1 }}</td>
              <td>
                <RouterLink :to="'/records/' + c.member.id" :class="'gender-' + (c.member.gender || 'M')" style="font-weight:700">
                  {{ c.member.name }}
                </RouterLink>
              </td>
              <td>{{ c.rounds }}R</td>
              <td>{{ c.avg_gross }}</td>
              <td style="font-weight:700;color:#198754">{{ c.best_gross }}</td>
              <td>{{ c.avg_net }}</td>
              <td>{{ c.wins ? c.wins + '회' : '−' }}</td>
              <td style="font-weight:700;color:#0d6efd">{{ Number(c.points).toLocaleString() }}</td>
              <td class="ev">
                <span v-if="c.ace" class="b bg-ace">홀인원 {{ c.ace }}</span>
                <span v-if="c.albatross" class="b bg-alb">알바 {{ c.albatross }}</span>
                <span v-if="c.eagle" class="b bg-eag">이글 {{ c.eagle }}</span>
                <span v-if="c.birdie" class="b bg-bir">버디 {{ c.birdie }}</span>
                <span v-if="!c.ace && !c.albatross && !c.eagle && !c.birdie" class="muted">−</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="muted" style="margin-top:6px">그로스·베스트는 핸디캡 보정 전 실제 타수. 통산 포인트 = 전 시즌 (순위+보너스) 합산.</p>
    </div>
  </div>
</template>

<style scoped>
.hero { background: linear-gradient(135deg, #0f5132, #198754); color: #fff; }
.hero-label { font-size: 11px; opacity: .8; letter-spacing: 1px; }
.hero-num { font-size: 32px; font-weight: 800; margin-top: 4px; }
.hero-name { font-size: 18px; font-weight: 700; margin-left: 6px; }
.tag { font-size: 11px; background: #e2e8f0; color: #475569; padding: 1px 6px; border-radius: 4px; }
.scroll { overflow-x: auto; }
.ev .b { font-size: 11px; padding: 1px 5px; border-radius: 4px; margin-right: 2px; color: #fff; white-space: nowrap; }
.bg-ace { background: #dc3545; } .bg-alb { background: #f59e0b; }
.bg-eag { background: #0dcaf0; color: #0f172a !important; } .bg-bir { background: #198754; }
</style>
