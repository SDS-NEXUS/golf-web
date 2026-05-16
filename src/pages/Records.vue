<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { apiGet } from '../api'

const loading = ref(true)
const error = ref('')
const d = ref(null)
const champLabels = (s) => (s.is_current ? ['현재 1위', '2위', '3위'] : ['우승', '준우승', '3위'])

onMounted(async () => {
  try { d.value = await apiGet('/records') }
  catch (e) { error.value = e.message }
  finally { loading.value = false }
})
</script>

<template>
  <div v-if="loading" class="loading">불러오는 중…</div>
  <div v-else-if="error" class="error">통산 기록을 불러오지 못했습니다</div>
  <div v-else-if="!d.careers.length" class="info-card text-center text-muted">확정된 라운드가 아직 없습니다.</div>
  <div v-else>
    <div v-if="d.best_ever" class="rec-best">
      <div style="font-size:10px;opacity:.8;letter-spacing:1px;">역대 최저타 · BEST GROSS</div>
      <div class="d-flex align-items-baseline gap-2 mt-1">
        <span class="bn">{{ d.best_ever.best_gross }}</span>
        <RouterLink :to="'/records/' + d.best_ever.member.id" style="font-size:15px;font-weight:700;color:#fff;">
          {{ d.best_ever.member.name }}
        </RouterLink>
      </div>
      <div v-if="d.best_ever.best_round" style="font-size:10px;opacity:.85;margin-top:2px;">
        {{ String(d.best_ever.best_round.play_date).slice(0, 10) }} · {{ d.best_ever.best_round.club?.name }}
      </div>
    </div>

    <template v-if="d.season_champs && d.season_champs.length">
      <div class="section-title">역대 시즌 우승자</div>
      <div v-for="(sc, i) in d.season_champs" :key="i" class="info-card">
        <div class="row-l">
          <strong>{{ sc.season.name }}</strong>
          <span v-if="sc.season.is_current" class="badge-soft">진행중</span>
        </div>
        <div v-for="(t, ti) in sc.top" :key="ti" class="row-l">
          <span>{{ champLabels(sc.season)[ti] || (ti + 1) + '위' }}</span>
          <span>
            <RouterLink :to="'/records/' + t.member.id" :class="'gender-' + (t.member.gender || 'M')" style="font-weight:700;">
              {{ t.member.name }}
            </RouterLink>
            <span class="text-muted"> {{ Number(t.total).toLocaleString() }}</span>
          </span>
        </div>
      </div>
    </template>

    <div class="section-title">선수별 통산 기록</div>
    <div v-for="(c, i) in d.careers" :key="i" class="crec">
      <div class="crec-top">
        <span class="crec-name">{{ i + 1 }}.
          <RouterLink :to="'/records/' + c.member.id" :class="'gender-' + (c.member.gender || 'M')">{{ c.member.name }}</RouterLink>
        </span>
        <span class="crec-pts">{{ Number(c.points).toLocaleString() }}<span style="font-size:9px;color:#64748b;font-weight:500;"> pt</span></span>
      </div>
      <div class="crec-grid">
        <div><div class="k">참가</div><div class="v">{{ c.rounds }}R</div></div>
        <div><div class="k">평균 그로스</div><div class="v">{{ c.avg_gross }}</div></div>
        <div><div class="k">베스트</div><div class="v text-success">{{ c.best_gross }}</div></div>
        <div><div class="k">라운드 1위</div><div class="v">{{ c.wins }}</div></div>
      </div>
      <div v-if="c.ace || c.albatross || c.eagle || c.birdie" class="crec-ev">
        <span v-if="c.ace">홀인원 {{ c.ace }}</span>
        <span v-if="c.albatross">알바 {{ c.albatross }}</span>
        <span v-if="c.eagle">이글 {{ c.eagle }}</span>
        <span v-if="c.birdie">버디 {{ c.birdie }}</span>
      </div>
    </div>

    <p class="text-muted" style="font-size:10px;padding:4px;">
      그로스·베스트는 핸디캡 보정 전 실제 타수. 통산 포인트 = 전 시즌 (순위+보너스) 합산.
    </p>
  </div>
</template>

<style scoped>
.rec-best { background: linear-gradient(135deg, #0f5132, #198754); color: #fff; border-radius: 10px; padding: 14px; margin-bottom: 10px; }
.rec-best .bn { font-size: 30px; font-weight: 800; line-height: 1; }
.rec-best a { text-decoration: none; }
.crec { background: #fff; border-radius: 10px; padding: 10px 12px; margin-bottom: 8px; }
.crec-top { display: flex; justify-content: space-between; align-items: center; }
.crec-name { font-weight: 700; font-size: 14px; }
.crec-name a { text-decoration: none; }
.crec-pts { font-size: 15px; font-weight: 800; color: #0f5132; }
.crec-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 8px; }
.crec-grid > div { background: #f8fafc; border-radius: 6px; padding: 5px 4px; text-align: center; }
.crec-grid .k { font-size: 9px; color: #64748b; }
.crec-grid .v { font-size: 13px; font-weight: 700; color: #0f172a; }
.crec-ev { margin-top: 6px; font-size: 10px; }
.crec-ev span { background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px; margin-right: 3px; }
</style>
