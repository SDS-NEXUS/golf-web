<script setup>
import { ref } from 'vue'
import { unlock, isUnlocked, lock } from '../api'

const unlocked = ref(isUnlocked())
const pin = ref('')
const error = ref('')
const busy = ref(false)

async function doUnlock() {
  error.value = ''
  busy.value = true
  try {
    await unlock(pin.value)
    unlocked.value = true
    pin.value = ''
  } catch (e) {
    error.value = e.status === 429 ? '시도 횟수 초과 — 잠시 후 다시.' : 'PIN이 올바르지 않습니다.'
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
  <div class="card" v-if="!unlocked">
    <h2>관리자 설정</h2>
    <p class="muted" style="margin-bottom:12px">관리 기능을 쓰려면 4자리 PIN을 입력하세요.</p>
    <form @submit.prevent="doUnlock" style="display:flex;gap:8px">
      <input v-model="pin" type="password" inputmode="numeric" maxlength="4"
             placeholder="••••" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;width:90px;text-align:center;font-size:16px" />
      <button class="btn" :disabled="busy">잠금 해제</button>
    </form>
    <p v-if="error" class="error" style="padding:8px 0">{{ error }}</p>
  </div>

  <div class="card" v-else>
    <h2>관리자 설정</h2>
    <p class="muted">잠금 해제됨 — 라운드·시즌·구장·멤버 관리 화면은 구현 예정입니다.</p>
    <button class="btn" style="background:#64748b;margin-top:12px" @click="doLock">잠금</button>
  </div>
</template>
