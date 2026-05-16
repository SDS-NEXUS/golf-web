<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiGet, apiSend } from '../api'

const view = ref('list') // list | create | scores
const err = ref('')
const loading = ref(true)
const rounds = ref([])
const DOW = ['일', '월', '화', '수', '목', '금', '토']
const dko = (d) => (d ? DOW[new Date(String(d).slice(0, 10)).getDay()] : '')

async function loadRounds() {
  loading.value = true
  try { rounds.value = (await apiGet('/rounds')).rounds || [] }
  catch (e) { err.value = e.message }
  finally { loading.value = false }
}

/* ── 라운드 생성 ── */
const cf = ref(null)
const meta = ref({ seasons: [], clubs: [], members: [] })
async function openCreate() {
  err.value = ''
  try {
    const [s, c, m] = await Promise.all([
      apiSend('GET', '/admin/seasons'),
      apiSend('GET', '/admin/clubs'),
      apiSend('GET', '/admin/members'),
    ])
    meta.value = { seasons: s.seasons || [], clubs: c.clubs || [], members: m.members || [] }
    const cur = meta.value.seasons.find((x) => x.is_current) || meta.value.seasons[0]
    cf.value = {
      season_id: cur?.id || '', play_date: new Date().toISOString().slice(0, 10),
      club_id: '', front_course_id: '', back_course_id: '', memo: '',
      member_ids: meta.value.members.filter((m) => m.active).map((m) => m.id),
      guests: [{ name: '', gender: 'M' }, { name: '', gender: 'M' }],
    }
    view.value = 'create'
  } catch (e) { err.value = e.data?.message || e.message }
}
const courses = computed(() => meta.value.clubs.find((c) => c.id == cf.value?.club_id)?.courses || [])
function toggleMember(id) {
  const a = cf.value.member_ids
  const i = a.indexOf(id)
  i >= 0 ? a.splice(i, 1) : a.push(id)
}
async function submitCreate() {
  err.value = ''
  try {
    await apiSend('POST', '/admin/rounds', {
      ...cf.value,
      guests: cf.value.guests.filter((g) => g.name.trim()),
    })
    view.value = 'list'
    await loadRounds()
  } catch (e) {
    err.value = e.data?.errors ? Object.values(e.data.errors).flat().join(' ') : (e.data?.message || e.message)
  }
}

/* ── 점수 입력 ── */
const sr = ref(null)
async function openScores(id) {
  err.value = ''
  try {
    const d = await apiGet('/rounds/' + id)
    const entries = (d.round.scores || []).map((s) => ({
      member_id: s.member_id, name: s.member?.name, gender: s.member?.gender,
      strokes: Array.from({ length: 18 }, (_, i) =>
        s.strokes && s.strokes[i] != null && s.strokes[i] !== '' ? Number(s.strokes[i]) : null),
    }))
    sr.value = { round: d.round, par: d.par || [], entries, hole: 1 }
    view.value = 'scores'
  } catch (e) { err.value = e.data?.message || e.message }
}
function step(e, delta) {
  const i = sr.value.hole - 1
  const v = e.strokes[i]
  e.strokes[i] = Math.max(-5, Math.min(8, v == null ? (delta > 0 ? 1 : -1) : v + delta))
}
const holeFilled = (h) => sr.value.entries.length > 0 && sr.value.entries.every((e) => e.strokes[h - 1] != null)
function scoresBody() {
  return { scores: sr.value.entries.map((e) => ({ member_id: e.member_id, strokes: e.strokes })) }
}
async function saveScores(msg = true) {
  err.value = ''
  try {
    await apiSend('POST', '/admin/rounds/' + sr.value.round.id + '/scores', scoresBody())
    if (msg) alert('저장되었습니다.')
  } catch (e) { err.value = e.data?.message || e.message; throw e }
}
async function finalize() {
  if (!confirm('모든 홀 입력이 끝났나요? 결과를 확정합니다.')) return
  try {
    await saveScores(false)
    await apiSend('POST', '/admin/rounds/' + sr.value.round.id + '/finalize')
    view.value = 'list'
    await loadRounds()
  } catch (e) { err.value = e.data?.message || e.message }
}

/* ── 라운드 액션 ── */
async function act(path, r, confirmMsg) {
  if (confirmMsg && !confirm(confirmMsg)) return
  err.value = ''
  try { await apiSend(path.method, path.url(r)); await loadRounds() }
  catch (e) { err.value = e.data?.message || e.message }
}
const doFinalize = (r) => act({ method: 'POST', url: (x) => '/admin/rounds/' + x.id + '/finalize' }, r, '이 라운드를 확정할까요?')
const doUnfinalize = (r) => act({ method: 'POST', url: (x) => '/admin/rounds/' + x.id + '/unfinalize' }, r, '확정을 해제할까요?')
const doDelete = (r) => act({ method: 'DELETE', url: (x) => '/admin/rounds/' + x.id }, r, '라운드를 삭제할까요? 되돌릴 수 없습니다.')

onMounted(loadRounds)
</script>

<template>
  <p v-if="err" class="text-danger" style="font-size:12px">{{ err }}</p>

  <!-- 목록 -->
  <template v-if="view === 'list'">
    <div class="d-flex justify-content-between align-items-center" style="margin:6px 4px">
      <span class="section-title" style="margin:0">라운드 관리</span>
      <button class="btn btn-success btn-sm" @click="openCreate">+ 새 라운드</button>
    </div>
    <div v-if="loading" class="loading">불러오는 중…</div>
    <template v-else>
      <div v-for="r in rounds" :key="r.id" class="info-card">
        <div class="d-flex justify-content-between">
          <strong>{{ String(r.play_date).slice(0, 10) }} ({{ dko(r.play_date) }})</strong>
          <span :class="r.finalized ? 'badge bg-success' : 'badge bg-secondary'">{{ r.finalized ? '확정' : '진행중' }}</span>
        </div>
        <div class="text-muted" style="font-size:11px;margin:2px 0 6px">
          {{ r.club?.name }} · {{ r.front_course?.course_name }} / {{ r.back_course?.course_name }}
        </div>
        <div class="d-flex gap-1 flex-wrap">
          <button class="btn btn-outline-primary btn-sm" @click="openScores(r.id)">점수 입력</button>
          <button v-if="!r.finalized" class="btn btn-outline-success btn-sm" @click="doFinalize(r)">확정</button>
          <button v-else class="btn btn-outline-warning btn-sm" @click="doUnfinalize(r)">확정 해제</button>
          <button class="btn btn-outline-danger btn-sm" @click="doDelete(r)">삭제</button>
        </div>
      </div>
      <div v-if="!rounds.length" class="info-card text-center text-muted">등록된 라운드가 없습니다.</div>
    </template>
  </template>

  <!-- 라운드 생성 -->
  <template v-else-if="view === 'create' && cf">
    <div class="section-title">새 라운드</div>
    <div class="info-card">
      <label class="fl">시즌</label>
      <select v-model="cf.season_id" class="fc">
        <option v-for="s in meta.seasons" :key="s.id" :value="s.id">{{ s.name }}{{ s.is_current ? ' (현재)' : '' }}</option>
      </select>
      <label class="fl">플레이 날짜</label>
      <input type="date" v-model="cf.play_date" class="fc" />
      <label class="fl">구장</label>
      <select v-model="cf.club_id" class="fc" @change="cf.front_course_id = ''; cf.back_course_id = ''">
        <option value="">— 선택 —</option>
        <option v-for="c in meta.clubs" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <label class="fl">전반 코스</label>
      <select v-model="cf.front_course_id" class="fc">
        <option value="">— 선택 —</option>
        <option v-for="co in courses" :key="co.id" :value="co.id">{{ co.course_name }}</option>
      </select>
      <label class="fl">후반 코스 <span class="text-muted">(9홀×2 구장은 전반과 동일 선택)</span></label>
      <select v-model="cf.back_course_id" class="fc">
        <option value="">— 선택 —</option>
        <option v-for="co in courses" :key="co.id" :value="co.id">{{ co.course_name }}</option>
      </select>
      <label class="fl">메모</label>
      <input type="text" v-model="cf.memo" class="fc" maxlength="500" />
    </div>

    <div class="info-card">
      <label class="fl">참가 멤버</label>
      <div class="d-flex flex-wrap" style="gap:4px">
        <label v-for="m in meta.members" :key="m.id" class="chip" :class="{ on: cf.member_ids.includes(m.id) }">
          <input type="checkbox" :checked="cf.member_ids.includes(m.id)" @change="toggleMember(m.id)" hidden />
          {{ m.name }} ({{ m.gender === 'F' ? '여' : '남' }})
        </label>
      </div>
    </div>

    <div class="info-card">
      <label class="fl">게스트 (이름 입력된 것만 추가)</label>
      <div v-for="(g, i) in cf.guests" :key="i" class="d-flex gap-2 mb-1">
        <input v-model="g.name" :placeholder="'게스트 ' + (i + 1)" class="fc" style="flex:1" />
        <select v-model="g.gender" class="fc" style="width:70px"><option value="M">남</option><option value="F">여</option></select>
      </div>
      <button class="btn btn-outline-secondary btn-sm" @click="cf.guests.push({ name: '', gender: 'M' })">+ 슬롯</button>
    </div>

    <button class="btn btn-success w-100" @click="submitCreate">라운드 생성</button>
    <button class="btn btn-outline-secondary w-100 mt-2" @click="view = 'list'">취소</button>
  </template>

  <!-- 점수 입력 -->
  <template v-else-if="view === 'scores' && sr">
    <a class="text-muted" style="font-size:12px" @click="view = 'list'; loadRounds()">
      <i class="fa-solid fa-arrow-left"></i> 라운드 목록
    </a>
    <div class="info-card py-2 mt-1">
      <strong>{{ String(sr.round.play_date).slice(0, 10) }}</strong> · {{ sr.round.club?.name }}
      <span v-if="sr.round.finalized" class="badge bg-success ms-1">확정</span>
    </div>
    <div class="holes-bar">
      <a v-for="h in 18" :key="h" :class="{ cur: h === sr.hole, filled: holeFilled(h) }" @click="sr.hole = h">{{ h }}</a>
    </div>
    <div class="hole-card">
      <div class="hole-head">
        <div>
          <span class="hole-num">{{ sr.hole }}H</span>
          <span class="hole-par">Par {{ sr.par[sr.hole - 1] ?? 4 }}</span>
        </div>
        <span class="hole-pill">{{ sr.hole <= 9 ? '전반' : '후반' }}</span>
      </div>
      <div v-for="e in sr.entries" :key="e.member_id" class="player-row">
        <span class="player-name" :class="'gender-' + (e.gender || 'M')">{{ e.name }}</span>
        <div class="toparbox">
          <button class="btn-tap" @click="step(e, -1)">−</button>
          <input type="number" v-model.number="e.strokes[sr.hole - 1]" min="-5" max="8" />
          <button class="btn-tap" @click="step(e, 1)">＋</button>
        </div>
      </div>
      <p class="text-muted" style="font-size:10px;margin-top:6px">값은 Par 대비(예: 보기=+1, 버디=−1). 미입력은 비워둠.</p>
    </div>
    <div class="d-flex gap-2">
      <button v-if="sr.hole > 1" class="btn btn-outline-secondary flex-fill" @click="sr.hole--">◀ 이전</button>
      <button class="btn btn-primary flex-fill" @click="saveScores()">저장</button>
      <button v-if="sr.hole < 18" class="btn btn-success flex-fill" @click="sr.hole++">다음 ▶</button>
    </div>
    <button v-if="!sr.round.finalized" class="btn btn-warning w-100 mt-3" @click="finalize">저장 후 결과 확정</button>
  </template>
</template>

<style scoped>
.fl { font-size: 12px; font-weight: 600; color: #475569; display: block; margin: 8px 0 3px; }
.fc { width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; }
.chip { padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 999px; font-size: 12px; background: #fff; cursor: pointer; }
.chip.on { background: #d1fae5; border-color: #198754; color: #0f5132; font-weight: 600; }
.holes-bar { display: flex; flex-wrap: wrap; gap: 3px; margin: 8px 0; }
.holes-bar a { width: 30px; height: 30px; line-height: 30px; text-align: center; font-size: 11px; font-weight: 700; border-radius: 6px; background: #e5e7eb; color: #475569; cursor: pointer; }
.holes-bar a.cur { background: #198754; color: #fff; }
.holes-bar a.filled { background: #bbf7d0; color: #0f5132; }
.hole-card { background: #fff; border-radius: 14px; padding: 14px; box-shadow: 0 2px 6px rgba(0,0,0,.04); margin-bottom: 12px; }
.hole-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.hole-num { font-size: 24px; font-weight: 800; }
.hole-par { font-size: 14px; color: #64748b; margin-left: 4px; }
.hole-pill { background: #f1f5f9; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
.player-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
.player-row:last-of-type { border-bottom: 0; }
.player-name { flex: 1; font-size: 14px; font-weight: 700; }
.toparbox { display: flex; gap: 4px; align-items: center; }
.btn-tap { width: 36px; height: 36px; border-radius: 50%; font-size: 18px; font-weight: 700; background: #e5e7eb; color: #475569; border: 0; }
.toparbox input { width: 52px; text-align: center; font-size: 18px; font-weight: 700; border: 2px solid #e5e7eb; border-radius: 8px; padding: 6px 0; }
</style>
