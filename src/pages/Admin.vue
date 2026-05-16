<script setup>
import { ref } from 'vue'
import { unlock, isUnlocked, lock } from '../api'
import AdminRounds from '../admin/AdminRounds.vue'
import AdminSeasons from '../admin/AdminSeasons.vue'
import AdminClubs from '../admin/AdminClubs.vue'
import AdminMembers from '../admin/AdminMembers.vue'

const unlocked = ref(isUnlocked())
const pin = ref('')
const err = ref('')
const busy = ref(false)
const tab = ref('rounds')

async function doUnlock() {
  err.value = ''
  busy.value = true
  try {
    await unlock(pin.value)
    unlocked.value = true
    pin.value = ''
  } catch (e) {
    err.value = e.status === 429 ? '시도 횟수 초과 — 잠시 후 다시.' : 'PIN이 올바르지 않습니다.'
  } finally {
    busy.value = false
  }
}
function doLock() {
  lock()
  unlocked.value = false
}
</script>

<template>
  <div v-if="!unlocked">
    <div class="section-title">관리자</div>
    <div class="info-card">
      <p class="text-muted mb-2" style="font-size:13px">관리 기능을 쓰려면 4자리 PIN을 입력하세요.</p>
      <form @submit.prevent="doUnlock" class="d-flex gap-2">
        <input v-model="pin" type="password" inputmode="numeric" maxlength="4" placeholder="••••"
          style="width:90px;text-align:center;font-size:18px;padding:8px;border:1px solid #cbd5e1;border-radius:6px;" />
        <button class="btn btn-success" :disabled="busy">잠금 해제</button>
      </form>
      <p v-if="err" class="text-danger mt-2" style="font-size:13px">{{ err }}</p>
    </div>
  </div>

  <div v-else>
    <div class="adm-tabs">
      <button :class="{ on: tab === 'rounds' }" @click="tab = 'rounds'">라운드</button>
      <button :class="{ on: tab === 'seasons' }" @click="tab = 'seasons'">시즌</button>
      <button :class="{ on: tab === 'clubs' }" @click="tab = 'clubs'">구장·코스</button>
      <button :class="{ on: tab === 'members' }" @click="tab = 'members'">멤버</button>
    </div>
    <AdminRounds v-if="tab === 'rounds'" />
    <AdminSeasons v-else-if="tab === 'seasons'" />
    <AdminClubs v-else-if="tab === 'clubs'" />
    <AdminMembers v-else-if="tab === 'members'" />
    <button class="btn btn-secondary w-100 mt-3" @click="doLock">잠금</button>
  </div>
</template>

<style scoped>
.adm-tabs { display: flex; gap: 4px; margin-bottom: 10px; }
.adm-tabs button {
  flex: 1; padding: 8px 0; font-size: 13px; font-weight: 600;
  border: 1px solid #cbd5e1; background: #fff; border-radius: 6px; color: #475569;
}
.adm-tabs button.on { background: #198754; color: #fff; border-color: #198754; }
</style>
