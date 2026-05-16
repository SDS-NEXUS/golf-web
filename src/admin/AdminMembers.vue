<script setup>
import { ref, onMounted } from 'vue'
import { apiSend } from '../api'

const members = ref([])
const loading = ref(true)
const err = ref('')
const blank = () => ({ id: null, name: '', gender: 'M', active: true })
const form = ref(blank())

async function load() {
  loading.value = true
  try { members.value = (await apiSend('GET', '/admin/members')).members || [] }
  catch (e) { err.value = e.message }
  finally { loading.value = false }
}
function edit(m) { form.value = { id: m.id, name: m.name, gender: m.gender, active: !!m.active } }
function reset() { form.value = blank() }
async function save() {
  err.value = ''
  if (!form.value.name.trim()) { err.value = '이름을 입력하세요.'; return }
  try {
    if (form.value.id) await apiSend('PUT', '/admin/members/' + form.value.id, form.value)
    else await apiSend('POST', '/admin/members', form.value)
    reset()
    await load()
  } catch (e) { err.value = e.data?.message || e.message }
}
async function del(m) {
  if (!confirm(`멤버 [${m.name}] 삭제할까요?`)) return
  try { await apiSend('DELETE', '/admin/members/' + m.id); await load() }
  catch (e) { err.value = e.data?.message || e.message }
}
onMounted(load)
</script>

<template>
  <div class="section-title">멤버 관리</div>
  <div class="info-card">
    <div class="d-flex gap-2 mb-2">
      <input v-model="form.name" placeholder="이름" class="adm-in" style="flex:1" />
      <select v-model="form.gender" class="adm-in"><option value="M">남</option><option value="F">여</option></select>
    </div>
    <label class="text-muted" style="font-size:12px"><input type="checkbox" v-model="form.active" /> 활동중</label>
    <div class="d-flex gap-2 mt-2">
      <button class="btn btn-success btn-sm" @click="save">{{ form.id ? '수정 저장' : '멤버 추가' }}</button>
      <button v-if="form.id" class="btn btn-outline-secondary btn-sm" @click="reset">취소</button>
    </div>
    <p v-if="err" class="text-danger mt-1" style="font-size:12px">{{ err }}</p>
  </div>

  <div v-if="loading" class="loading">불러오는 중…</div>
  <template v-else>
    <div v-for="m in members" :key="m.id" class="rank-row">
      <div style="flex:1">
        <span :class="'gender-' + (m.gender || 'M')" style="font-weight:700">{{ m.name }}</span>
        <span class="badge-soft ms-1">{{ m.gender === 'F' ? '여' : '남' }}</span>
        <span v-if="!m.active" class="text-muted" style="font-size:11px"> · 비활동</span>
      </div>
      <button class="btn btn-outline-secondary btn-sm me-1" @click="edit(m)">수정</button>
      <button class="btn btn-outline-danger btn-sm" @click="del(m)">삭제</button>
    </div>
  </template>
</template>

<style scoped>
.adm-in { padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; }
</style>
