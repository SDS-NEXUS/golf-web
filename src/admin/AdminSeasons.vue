<script setup>
import { ref, onMounted } from 'vue'
import { apiSend } from '../api'

const seasons = ref([])
const loading = ref(true)
const err = ref('')
const blank = () => ({
  id: null, year: new Date().getFullYear(), name: '',
  planned_rounds: 8, drop_count: 2, min_qualifying_rounds: 4, is_current: false,
})
const form = ref(blank())

async function load() {
  loading.value = true
  try { seasons.value = (await apiSend('GET', '/admin/seasons')).seasons || [] }
  catch (e) { err.value = e.message }
  finally { loading.value = false }
}
function edit(s) {
  form.value = {
    id: s.id, year: s.year, name: s.name, planned_rounds: s.planned_rounds,
    drop_count: s.drop_count, min_qualifying_rounds: s.min_qualifying_rounds,
    is_current: !!s.is_current,
  }
}
function reset() { form.value = blank() }
async function save() {
  err.value = ''
  if (!form.value.name.trim()) { err.value = '시즌명을 입력하세요.'; return }
  try {
    if (form.value.id) await apiSend('PUT', '/admin/seasons/' + form.value.id, form.value)
    else await apiSend('POST', '/admin/seasons', form.value)
    reset()
    await load()
  } catch (e) { err.value = e.data?.message || e.message }
}
async function del(s) {
  if (!confirm(`시즌 [${s.name}] 삭제할까요?`)) return
  try { await apiSend('DELETE', '/admin/seasons/' + s.id); await load() }
  catch (e) { err.value = e.data?.message || e.message }
}
onMounted(load)
</script>

<template>
  <div class="section-title">시즌 관리</div>
  <div class="info-card">
    <div class="d-flex gap-2 mb-2">
      <input v-model.number="form.year" type="number" placeholder="연도" class="adm-in" style="width:80px"
        :disabled="!!form.id" />
      <input v-model="form.name" placeholder="시즌명 (예: 2026 시즌)" class="adm-in" style="flex:1" />
    </div>
    <div class="d-flex gap-2 mb-2">
      <label class="adm-l">계획 라운드<input v-model.number="form.planned_rounds" type="number" class="adm-in" /></label>
      <label class="adm-l">드롭<input v-model.number="form.drop_count" type="number" class="adm-in" /></label>
      <label class="adm-l">자격 최소<input v-model.number="form.min_qualifying_rounds" type="number" class="adm-in" /></label>
    </div>
    <label class="text-muted" style="font-size:12px"><input type="checkbox" v-model="form.is_current" /> 현재 시즌으로 설정</label>
    <div class="d-flex gap-2 mt-2">
      <button class="btn btn-success btn-sm" @click="save">{{ form.id ? '수정 저장' : '시즌 추가' }}</button>
      <button v-if="form.id" class="btn btn-outline-secondary btn-sm" @click="reset">취소</button>
    </div>
    <p v-if="err" class="text-danger mt-1" style="font-size:12px">{{ err }}</p>
  </div>

  <div v-if="loading" class="loading">불러오는 중…</div>
  <template v-else>
    <div v-for="s in seasons" :key="s.id" class="rank-row">
      <div style="flex:1">
        <span style="font-weight:700">{{ s.name }}</span>
        <span v-if="s.is_current" class="badge-soft ms-1">현재</span>
        <div class="text-muted" style="font-size:11px">
          {{ s.year }} · 계획 {{ s.planned_rounds }}R · 드롭 {{ s.drop_count }} · 자격 {{ s.min_qualifying_rounds }}R
        </div>
      </div>
      <button class="btn btn-outline-secondary btn-sm me-1" @click="edit(s)">수정</button>
      <button class="btn btn-outline-danger btn-sm" @click="del(s)">삭제</button>
    </div>
  </template>
</template>

<style scoped>
.adm-in { padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; width: 100%; }
.adm-l { flex: 1; font-size: 11px; color: #64748b; display: flex; flex-direction: column; gap: 2px; }
</style>
