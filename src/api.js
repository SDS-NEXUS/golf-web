// 골프 API 클라이언트 — 백엔드(golf-api)와 통신
const BASE = (import.meta.env.VITE_API_BASE || 'https://golf-api.sdskorea.kr/api').replace(/\/$/, '')

const TOKEN_KEY = 'golf_admin_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}
export function isUnlocked() {
  return !!getToken()
}
export function lock() {
  localStorage.removeItem(TOKEN_KEY)
}

/** 공개 읽기 — GET */
export async function apiGet(path) {
  const res = await fetch(BASE + path, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return res.json()
}

/** 쓰기/인증 — 토큰 자동 첨부 */
export async function apiSend(method, path, body) {
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' }
  const t = getToken()
  if (t) headers.Authorization = 'Bearer ' + t
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || ('HTTP ' + res.status))
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

/** 관리자 4자리 PIN 잠금 해제 */
export async function unlock(pin) {
  const data = await apiSend('POST', '/unlock', { pin })
  localStorage.setItem(TOKEN_KEY, data.token)
  return data
}
