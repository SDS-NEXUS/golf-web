<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiSend } from '../api'

const view = ref('list') // list | club | course
const err = ref('')
const loading = ref(true)
const clubs = ref([])

const sum = (holes, key) => (holes || []).reduce((a, h) => a + (Number(h[key]) || 0), 0)

async function load() {
  loading.value = true
  try { clubs.value = (await apiSend('GET', '/admin/clubs')).clubs || [] }
  catch (e) { err.value = e.message }
  finally { loading.value = false }
}

/* ── 구장 ── */
const clubForm = ref(null)
function newClub() {
  clubForm.value = { id: null, name: '', white_course_rating: '', white_slope_rating: '', ladies_course_rating: '', ladies_slope_rating: '', memo: '' }
  view.value = 'club'
}
function editClub(c) {
  clubForm.value = {
    id: c.id, name: c.name,
    white_course_rating: c.white_course_rating ?? '', white_slope_rating: c.white_slope_rating ?? '',
    ladies_course_rating: c.ladies_course_rating ?? '', ladies_slope_rating: c.ladies_slope_rating ?? '',
    memo: c.memo ?? '',
  }
  view.value = 'club'
}
async function saveClub() {
  err.value = ''
  try {
    const f = clubForm.value
    if (f.id) await apiSend('PUT', '/admin/clubs/' + f.id, f)
    else await apiSend('POST', '/admin/clubs', f)
    view.value = 'list'
    await load()
  } catch (e) { err.value = e.data?.errors ? Object.values(e.data.errors).flat().join(' ') : (e.data?.message || e.message) }
}
async function delClub(c) {
  if (!confirm(`구장 [${c.name}] 및 소속 코스를 모두 삭제할까요?`)) return
  try { await apiSend('DELETE', '/admin/clubs/' + c.id); await load() }
  catch (e) { err.value = e.data?.message || e.message }
}

/* ── 코스 (9홀) ── */
const courseForm = ref(null)
const blankHoles = () => Array.from({ length: 9 }, () => ({ par: 4, handicap: '', white_m: '', ladies_m: '', avg_male: '', avg_female: '' }))
function newCourse(clubId) {
  courseForm.value = { id: null, club_id: clubId, course_name: '', memo: '', holes: blankHoles() }
  view.value = 'course'
}
function editCourse(co) {
  const holes = blankHoles().map((b, i) => ({ ...b, ...(co.holes?.[i] || {}) }))
  courseForm.value = { id: co.id, club_id: co.club_id, course_name: co.course_name, memo: co.memo ?? '', holes }
  view.value = 'course'
}
async function saveCourse() {
  err.value = ''
  try {
    const f = courseForm.value
    if (f.id) await apiSend('PUT', '/admin/courses/' + f.id, f)
    else await apiSend('POST', '/admin/courses', f)
    view.value = 'list'
    await load()
  } catch (e) { err.value = e.data?.errors ? Object.values(e.data.errors).flat().join(' ') : (e.data?.message || e.message) }
}
async function delCourse(co) {
  if (!confirm(`코스 [${co.course_name}] 를 삭제할까요?`)) return
  try { await apiSend('DELETE', '/admin/courses/' + co.id); await load() }
  catch (e) { err.value = e.data?.message || e.message }
}
const cTot = computed(() => {
  const h = courseForm.value?.holes || []
  return { par: sum(h, 'par'), white: sum(h, 'white_m'), ladies: sum(h, 'ladies_m') }
})

onMounted(load)
</script>

<template>
  <p v-if="err" class="text-danger" style="font-size:12px">{{ err }}</p>

  <!-- 목록 -->
  <template v-if="view === 'list'">
    <div class="d-flex justify-content-between align-items-center" style="margin:6px 4px">
      <span class="section-title" style="margin:0">구장 · 코스 관리</span>
      <button class="btn btn-success btn-sm" @click="newClub">+ 구장 추가</button>
    </div>
    <div v-if="loading" class="loading">불러오는 중…</div>
    <template v-else>
      <div v-for="c in clubs" :key="c.id" class="info-card">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-1">
          <strong>{{ c.name }}</strong>
          <div class="d-flex gap-1">
            <button class="btn btn-outline-primary btn-sm" @click="newCourse(c.id)">+ 코스</button>
            <button class="btn btn-outline-secondary btn-sm" @click="editClub(c)">편집</button>
            <button class="btn btn-outline-danger btn-sm" @click="delClub(c)">삭제</button>
          </div>
        </div>
        <div class="text-muted" style="font-size:11px;margin-top:2px">
          White CR/SR {{ c.white_course_rating ?? '?' }}/{{ c.white_slope_rating ?? '?' }}
          · Ladies {{ c.ladies_course_rating ?? '?' }}/{{ c.ladies_slope_rating ?? '?' }}
        </div>
        <div v-for="co in (c.courses || [])" :key="co.id" class="course-row">
          <span style="flex:1">
            <strong>{{ co.course_name }}</strong>
            <span class="text-muted"> · Par {{ sum(co.holes, 'par') }} · White {{ sum(co.holes, 'white_m') }}m</span>
          </span>
          <button class="btn btn-outline-primary btn-sm me-1" @click="editCourse(co)">편집</button>
          <button class="btn btn-outline-danger btn-sm" @click="delCourse(co)">삭제</button>
        </div>
        <div v-if="!(c.courses || []).length" class="text-muted" style="font-size:11px;margin-top:4px">코스 없음 — "+ 코스"로 9홀 코스 등록</div>
      </div>
      <div v-if="!clubs.length" class="info-card text-center text-muted">등록된 구장이 없습니다.</div>
    </template>
  </template>

  <!-- 구장 폼 -->
  <template v-else-if="view === 'club' && clubForm">
    <div class="section-title">{{ clubForm.id ? '구장 편집' : '구장 추가' }}</div>
    <div class="info-card">
      <label class="fl">구장명</label>
      <input v-model="clubForm.name" class="fc" maxlength="100" />
      <div class="d-flex gap-2">
        <div style="flex:1"><label class="fl">White 코스레이팅</label><input v-model="clubForm.white_course_rating" type="number" step="0.1" class="fc" /></div>
        <div style="flex:1"><label class="fl">White 슬로프</label><input v-model="clubForm.white_slope_rating" type="number" class="fc" /></div>
      </div>
      <div class="d-flex gap-2">
        <div style="flex:1"><label class="fl">Ladies 코스레이팅</label><input v-model="clubForm.ladies_course_rating" type="number" step="0.1" class="fc" /></div>
        <div style="flex:1"><label class="fl">Ladies 슬로프</label><input v-model="clubForm.ladies_slope_rating" type="number" class="fc" /></div>
      </div>
      <label class="fl">메모</label>
      <input v-model="clubForm.memo" class="fc" maxlength="500" />
    </div>
    <button class="btn btn-success w-100" @click="saveClub">저장</button>
    <button class="btn btn-outline-secondary w-100 mt-2" @click="view = 'list'">취소</button>
  </template>

  <!-- 코스 폼 (9홀) -->
  <template v-else-if="view === 'course' && courseForm">
    <div class="section-title">{{ courseForm.id ? '코스 편집' : '코스 추가' }} (9홀)</div>
    <div class="info-card">
      <label class="fl">구장</label>
      <select v-model="courseForm.club_id" class="fc">
        <option v-for="c in clubs" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <label class="fl">코스 이름</label>
      <input v-model="courseForm.course_name" class="fc" maxlength="50" placeholder="예) 세븐 / 밸리" />
      <div class="text-muted" style="font-size:11px;margin-top:6px">
        합계 — Par {{ cTot.par }} · White {{ cTot.white }}m · Ladies {{ cTot.ladies }}m
      </div>
    </div>
    <div class="info-card" style="overflow-x:auto">
      <table class="hole-tbl">
        <thead>
          <tr><th>홀</th><th>Par</th><th>핸디캡</th><th>White</th><th>Ladies</th><th>남자평균</th><th>여자평균</th></tr>
        </thead>
        <tbody>
          <tr v-for="(h, i) in courseForm.holes" :key="i">
            <td class="hn">{{ i + 1 }}</td>
            <td><select v-model.number="h.par"><option :value="3">3</option><option :value="4">4</option><option :value="5">5</option><option :value="6">6</option></select></td>
            <td><input v-model="h.handicap" type="number" min="1" max="18" /></td>
            <td><input v-model="h.white_m" type="number" min="0" /></td>
            <td><input v-model="h.ladies_m" type="number" min="0" /></td>
            <td><input v-model="h.avg_male" type="number" step="0.01" /></td>
            <td><input v-model="h.avg_female" type="number" step="0.01" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <button class="btn btn-success w-100" @click="saveCourse">저장</button>
    <button class="btn btn-outline-secondary w-100 mt-2" @click="view = 'list'">취소</button>
  </template>
</template>

<style scoped>
.fl { font-size: 12px; font-weight: 600; color: #475569; display: block; margin: 8px 0 3px; }
.fc { width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; }
.course-row { display: flex; align-items: center; padding: 6px 0; border-top: 1px solid #f1f5f9; font-size: 13px; margin-top: 6px; }
.hole-tbl { border-collapse: collapse; font-size: 12px; }
.hole-tbl th, .hole-tbl td { border: 1px solid #e5e7eb; padding: 3px; text-align: center; }
.hole-tbl th { background: #f8fafc; font-size: 10px; }
.hole-tbl .hn { background: #f8fafc; font-weight: 700; }
.hole-tbl input, .hole-tbl select { width: 58px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px; font-size: 12px; text-align: center; }
</style>
